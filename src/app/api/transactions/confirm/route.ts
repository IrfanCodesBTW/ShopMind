// ============================================================================
// POST /api/transactions/confirm — Confirm a pending transaction
// Source: API_SPEC.md §POST /transactions/confirm, PRD.md §4.3
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ConfirmTransactionRequest } from '@/types';

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const body: ConfirmTransactionRequest = await request.json();

    if (!body.transaction_id) {
      return Errors.validation('transaction_id is required');
    }

    const supabase = await createServerSupabaseClient();

    // Fetch the pending transaction (RLS ensures merchant can only see own)
    const { data: existing, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', body.transaction_id)
      .eq('merchant_id', user.id)
      .single();

    if (fetchError || !existing) {
      return Errors.notFound('Transaction not found');
    }

    if (existing.status === 'confirmed') {
      return Errors.conflict('Transaction is already confirmed');
    }

    if (existing.status === 'cancelled') {
      return Errors.validation('Cannot confirm a cancelled transaction');
    }

    // Apply corrections if any
    const updates: Record<string, unknown> = {
      status: 'confirmed',
      ...(body.corrections || {}),
    };

    const { data: updated, error: updateError } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', body.transaction_id)
      .select()
      .single();

    if (updateError) {
      console.error('Transaction confirm error:', updateError);
      return Errors.internal('Failed to confirm transaction');
    }

    // Log the confirmation in audit_logs
    await supabase.from('audit_logs').insert({
      merchant_id: user.id,
      action: body.corrections ? 'confirm_with_corrections' : 'confirm',
      entity_type: 'transaction',
      entity_id: body.transaction_id,
      old_value: existing,
      new_value: updated,
    });

    // ── Credit Ledger Auto-Update ───────────────────────────────────────
    // When a credit transaction is confirmed, auto-create a ledger entry
    // and update the customer's balance.
    const confirmedIntent = updated.intent || existing.intent;
    if (['credit_given', 'credit_received'].includes(confirmedIntent) && updated.customer_name) {
      try {
        // Find or create customer by name
        let { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('name', updated.customer_name)
          .maybeSingle();

        if (!customer) {
          const { data: newCustomer } = await supabase
            .from('customers')
            .insert({
              merchant_id: user.id,
              name: updated.customer_name,
              phone: null,
              total_credit: 0,
              total_paid: 0,
            })
            .select()
            .single();
          customer = newCustomer;
        }

        if (customer) {
          const ledgerType = confirmedIntent === 'credit_given' ? 'credit' : 'debit';
          const amount = Number(updated.amount || existing.amount);
          const currentBalance = (customer.total_credit || 0) - (customer.total_paid || 0);
          const balanceAfter = ledgerType === 'credit'
            ? currentBalance + amount
            : currentBalance - amount;

          await supabase.from('credit_ledger').insert({
            merchant_id: user.id,
            customer_id: customer.id,
            transaction_id: body.transaction_id,
            amount,
            type: ledgerType,
            balance_after: balanceAfter,
          });

          const updateField = ledgerType === 'credit' ? 'total_credit' : 'total_paid';
          await supabase
            .from('customers')
            .update({ [updateField]: (customer[updateField] || 0) + amount })
            .eq('id', customer.id);
        }
      } catch (creditErr) {
        // Non-critical — don't fail the confirmation
        console.error('Credit ledger auto-update error:', creditErr);
      }
    }

    return successResponse(updated);
  } catch (err) {
    console.error('Confirm transaction error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}
