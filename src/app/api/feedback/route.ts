// ============================================================================
// POST /api/feedback — Save merchant feedback
// Source: ROADMAP Phase 3
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sanitizeText } from '@/lib/security/sanitize';

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const body = await request.json();

    const rating = Math.min(5, Math.max(1, parseInt(body.rating) || 0));
    const message = sanitizeText(body.message || '');
    const category = sanitizeText(body.category || 'general');

    if (!rating) {
      return Errors.validation('Rating (1-5) is required');
    }

    const supabase = await createServerSupabaseClient();

    // Store as an audit log with 'feedback' action type
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        merchant_id: user.id,
        action: 'feedback',
        entity_type: 'app',
        entity_id: 'feedback',
        old_value: null,
        new_value: { rating, message, category },
      })
      .select()
      .single();

    if (error) {
      console.error('Save feedback error:', error);
      return Errors.internal('Failed to save feedback');
    }

    return successResponse({ id: data.id, rating, message }, undefined, 201);
  } catch (err) {
    console.error('Feedback error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}
