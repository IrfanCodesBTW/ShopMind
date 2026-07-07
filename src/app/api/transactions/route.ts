// ============================================================================
// GET /api/transactions — List transactions with pagination & filters
// Source: API_SPEC.md §GET /transactions
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '20')));
    const status = searchParams.get('status');
    const intent = searchParams.get('intent');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const search = searchParams.get('search');

    const supabase = await createServerSupabaseClient();

    // Build query (RLS auto-scopes to merchant)
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (intent) query = query.eq('intent', intent);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);
    if (search) {
      query = query.or(
        `item.ilike.%${search}%,customer_name.ilike.%${search}%,raw_transcript.ilike.%${search}%`
      );
    }

    // Pagination
    const offset = (page - 1) * perPage;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('List transactions error:', error);
      return Errors.internal('Failed to fetch transactions');
    }

    return successResponse(data || [], {
      page,
      per_page: perPage,
      total: count || 0,
    });
  } catch (err) {
    console.error('List transactions error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}
