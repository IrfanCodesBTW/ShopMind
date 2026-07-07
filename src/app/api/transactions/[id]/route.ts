// ============================================================================
// GET/PUT /api/transactions/[id] — Single transaction operations
// Source: API_SPEC.md §GET /transactions/:id, §PUT /transactions/:id
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return Errors.notFound('Transaction not found');
  }

  return successResponse(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;
  const { user } = auth;

  const { id } = await params;
  const body = await request.json();

  const supabase = await createServerSupabaseClient();

  // Fetch existing for audit log
  const { data: existing } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (!existing) {
    return Errors.notFound('Transaction not found');
  }

  // Update
  const { data: updated, error: updateError } = await supabase
    .from('transactions')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return Errors.internal('Failed to update transaction');
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    merchant_id: user.id,
    action: 'update',
    entity_type: 'transaction',
    entity_id: id,
    old_value: existing,
    new_value: updated,
  });

  return successResponse(updated);
}
