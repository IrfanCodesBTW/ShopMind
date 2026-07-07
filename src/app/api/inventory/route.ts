// ============================================================================
// GET/POST /api/inventory — List and add inventory items
// Source: API_SPEC.md §Inventory, DATABASE_SCHEMA.md §inventory
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sanitizeText, sanitizeQuantity } from '@/lib/security/sanitize';

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const lowStockOnly = searchParams.get('low_stock') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') || '50')));

    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from('inventory')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('item_name', `%${search}%`);
    }

    // Filter by low stock: quantity <= reorder_level
    if (lowStockOnly) {
      query = query.filter('quantity', 'lte', 'reorder_level');
    }

    const offset = (page - 1) * perPage;
    query = query
      .order('item_name', { ascending: true })
      .range(offset, offset + perPage - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('List inventory error:', error);
      return Errors.internal('Failed to fetch inventory');
    }

    // Add computed low_stock flag
    const items = (data || []).map((item) => ({
      ...item,
      low_stock: item.quantity <= item.reorder_level,
    }));

    return successResponse(items, {
      page,
      per_page: perPage,
      total: count || 0,
    });
  } catch (err) {
    console.error('List inventory error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const body = await request.json();

    const itemName = sanitizeText(body.item_name);
    if (!itemName) {
      return Errors.validation('Item name is required', [
        { field: 'item_name', message: 'Name cannot be empty' },
      ]);
    }

    const quantity = sanitizeQuantity(body.quantity) ?? 0;
    const reorderLevel = sanitizeQuantity(body.reorder_level) ?? 5;

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('inventory')
      .insert({
        merchant_id: user.id,
        item_name: itemName,
        quantity,
        unit: body.unit ? sanitizeText(body.unit) : 'pc',
        reorder_level: reorderLevel,
      })
      .select()
      .single();

    if (error) {
      console.error('Create inventory item error:', error);
      if (error.code === '23505') {
        return Errors.conflict('An item with this name already exists');
      }
      return Errors.internal('Failed to add inventory item');
    }

    return successResponse(data, undefined, 201);
  } catch (err) {
    console.error('Create inventory error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}
