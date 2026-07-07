// ============================================================================
// GET/POST /api/customers — List and create customers
// Source: API_SPEC.md §Customers, DATABASE_SCHEMA.md §customers
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sanitizeText } from '@/lib/security/sanitize';

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '50')));

    const supabase = await createServerSupabaseClient();

    // Build query — RLS scopes to merchant automatically
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const offset = (page - 1) * perPage;
    query = query
      .order('name', { ascending: true })
      .range(offset, offset + perPage - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('List customers error:', error);
      return Errors.internal('Failed to fetch customers');
    }

    // Compute outstanding balance from total_credit - total_paid
    const customersWithBalance = (data || []).map((c) => ({
      ...c,
      outstanding_balance: (c.total_credit || 0) - (c.total_paid || 0),
    }));

    return successResponse(customersWithBalance, {
      page,
      per_page: perPage,
      total: count || 0,
    });
  } catch (err) {
    console.error('List customers error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const body = await request.json();

    const name = sanitizeText(body.name);
    if (!name) {
      return Errors.validation('Customer name is required', [
        { field: 'name', message: 'Name cannot be empty' },
      ]);
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('customers')
      .insert({
        merchant_id: user.id,
        name,
        phone: body.phone ? sanitizeText(body.phone) : null,
        total_credit: 0,
        total_paid: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Create customer error:', error);
      if (error.code === '23505') {
        return Errors.conflict('A customer with this name already exists');
      }
      return Errors.internal('Failed to create customer');
    }

    return successResponse(data, undefined, 201);
  } catch (err) {
    console.error('Create customer error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}
