// ============================================================================
// GET/PUT/DELETE /api/inventory/[id] — Single inventory item CRUD
// Source: API_SPEC.md §Inventory, DATABASE_SCHEMA.md §inventory
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sanitizeText, sanitizeQuantity } from '@/lib/security/sanitize';

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
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return Errors.notFound('Inventory item not found');
    }

    return successResponse({
      ...data,
      low_stock: data.quantity <= data.reorder_level,
    });
  } catch (err) {
    console.error('Get inventory item error:', err);
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

    if (body.item_name !== undefined) {
      const name = sanitizeText(body.item_name);
      if (!name) return Errors.validation('Item name cannot be empty');
      updates.item_name = name;
    }
    if (body.quantity !== undefined) {
      const qty = sanitizeQuantity(body.quantity);
      if (qty === null) return Errors.validation('Invalid quantity');
      updates.quantity = qty;
    }
    if (body.unit !== undefined) {
      updates.unit = sanitizeText(body.unit) || 'pc';
    }
    if (body.reorder_level !== undefined) {
      const rl = sanitizeQuantity(body.reorder_level);
      if (rl === null) return Errors.validation('Invalid reorder level');
      updates.reorder_level = rl;
    }

    if (Object.keys(updates).length === 0) {
      return Errors.validation('No valid fields to update');
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return Errors.notFound('Inventory item not found');
    }

    return successResponse({
      ...data,
      low_stock: data.quantity <= data.reorder_level,
    });
  } catch (err) {
    console.error('Update inventory item error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete inventory item error:', error);
      return Errors.internal('Failed to delete inventory item');
    }

    return successResponse({ deleted: true });
  } catch (err) {
    console.error('Delete inventory error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}
