// ============================================================================
// GET/POST /api/customers/[id]/credit — Credit ledger for a customer
// Source: DATABASE_SCHEMA.md §credit_ledger, API_SPEC.md §Credit
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sanitizeAmount } from '@/lib/security/sanitize';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const supabase = await createServerSupabaseClient();

    // Verify customer exists and belongs to merchant
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('id, name, total_credit, total_paid')
      .eq('id', id)
      .single();

    if (custError || !customer) {
      return Errors.notFound('Customer not found');
    }

    // Fetch credit ledger entries
    const { data: entries, error: ledgerError } = await supabase
      .from('credit_ledger')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false });

    if (ledgerError) {
      console.error('Credit ledger fetch error:', ledgerError);
      return Errors.internal('Failed to fetch credit history');
    }

    return successResponse({
      customer: {
        ...customer,
        outstanding_balance: (customer.total_credit || 0) - (customer.total_paid || 0),
      },
      entries: entries || [],
    });
  } catch (err) {
    console.error('Credit ledger error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;
  const { user } = auth;

  const { id: customerId } = await params;

  try {
    const body = await request.json();

    const amount = sanitizeAmount(body.amount);
    if (amount === null || amount <= 0) {
      return Errors.validation('A positive amount is required');
    }

    const type = body.type === 'debit' ? 'debit' : 'credit';

    const supabase = await createServerSupabaseClient();

    // Verify customer exists
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (custError || !customer) {
      return Errors.notFound('Customer not found');
    }

    // Calculate new balance
    const currentBalance = (customer.total_credit || 0) - (customer.total_paid || 0);
    const balanceAfter = type === 'credit'
      ? currentBalance + amount
      : currentBalance - amount;

    // Insert ledger entry
    const { data: entry, error: insertError } = await supabase
      .from('credit_ledger')
      .insert({
        merchant_id: user.id,
        customer_id: customerId,
        transaction_id: body.transaction_id || null,
        amount,
        type,
        balance_after: balanceAfter,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Credit ledger insert error:', insertError);
      return Errors.internal('Failed to record credit entry');
    }

    // Update customer totals
    const updateField = type === 'credit' ? 'total_credit' : 'total_paid';
    await supabase
      .from('customers')
      .update({
        [updateField]: (customer[updateField] || 0) + amount,
      })
      .eq('id', customerId);

    return successResponse(entry, undefined, 201);
  } catch (err) {
    console.error('Credit ledger error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}
