// ============================================================================
// POST /api/transactions/manual — Create a confirmed transaction manually
// Source: USER_FLOWS.md Flow 7, PRD §7.2
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sanitizeText, sanitizeAmount, sanitizeQuantity, sanitizeEnum } from '@/lib/security/sanitize';
import type { Intent, PaymentMode, DueStatus } from '@/types';

const VALID_INTENTS: readonly Intent[] = ['sale', 'expense', 'credit_given', 'credit_received', 'stock_update', 'return'];
const VALID_PAYMENT_MODES: readonly PaymentMode[] = ['cash', 'upi', 'card', 'credit', 'other'];
const VALID_DUE_STATUSES: readonly DueStatus[] = ['paid', 'due', 'partial', 'none'];

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const body = await request.json();

    // Validate required fields
    const amount = sanitizeAmount(body.amount);
    if (amount === null || amount <= 0) {
      return Errors.validation('A positive amount is required', [
        { field: 'amount', message: 'Must be a positive number' },
      ]);
    }

    const intent = sanitizeEnum(body.intent, VALID_INTENTS, 'sale');
    const paymentMode = sanitizeEnum(body.payment_mode, VALID_PAYMENT_MODES, 'cash');
    const dueStatus = sanitizeEnum(body.due_status, VALID_DUE_STATUSES, 'none');

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        merchant_id: user.id,
        intent,
        item: body.item ? sanitizeText(body.item) : null,
        quantity: sanitizeQuantity(body.quantity),
        unit: body.unit ? sanitizeText(body.unit) : null,
        amount,
        customer_name: body.customer_name ? sanitizeText(body.customer_name) : null,
        payment_mode: paymentMode,
        due_status: dueStatus,
        confidence_score: 1.0, // Manual = 100% confidence
        raw_transcript: null,
        provider_used: 'manual',
        status: 'confirmed', // Manual entries are immediately confirmed
      })
      .select()
      .single();

    if (error) {
      console.error('Manual transaction insert error:', error);
      return Errors.internal('Failed to save transaction');
    }

    // Log in audit_logs
    await supabase.from('audit_logs').insert({
      merchant_id: user.id,
      action: 'manual_entry',
      entity_type: 'transaction',
      entity_id: data.id,
      old_value: null,
      new_value: data,
    });

    return successResponse(data, undefined, 201);
  } catch (err) {
    console.error('Manual transaction error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}
