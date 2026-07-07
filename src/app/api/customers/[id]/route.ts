// ============================================================================
// GET/PUT /api/customers/[id] — Single customer detail and update
// Source: API_SPEC.md §Customers, DATABASE_SCHEMA.md §customers
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sanitizeText } from '@/lib/security/sanitize';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return Errors.notFound('Customer not found');
    }

    // Fetch recent credit transactions for this customer
    const { data: recentTxs } = await supabase
      .from('transactions')
      .select('*')
      .or(`customer_name.eq.${data.name}`)
      .in('intent', ['credit_given', 'credit_received'])
      .order('created_at', { ascending: false })
      .limit(20);

    return successResponse({
      ...data,
      outstanding_balance: (data.total_credit || 0) - (data.total_paid || 0),
      recent_transactions: recentTxs || [],
    });
  } catch (err) {
    console.error('Get customer error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = sanitizeText(body.name);
      if (!name) return Errors.validation('Name cannot be empty');
      updates.name = name;
    }
    if (body.phone !== undefined) {
      updates.phone = body.phone ? sanitizeText(body.phone) : null;
    }

    if (Object.keys(updates).length === 0) {
      return Errors.validation('No valid fields to update');
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return Errors.notFound('Customer not found');
    }

    return successResponse(data);
  } catch (err) {
    console.error('Update customer error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}
