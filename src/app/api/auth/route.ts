// ============================================================================
// Auth API Routes — Signup, Login, Logout, Me
// Source: API_SPEC.md §Auth, SECURITY.md §Auth
// ============================================================================

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, Errors } from '@/lib/api/response';
import { getAuthenticatedUser } from '@/lib/auth/middleware';

// ── POST /api/auth — Login ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const supabase = await createServerSupabaseClient();

    switch (action) {
      case 'signup': {
        const { email, password, name, shop_name } = body;

        if (!email || !password || !name || !shop_name) {
          return Errors.validation('Missing required fields', [
            ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
            ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
            ...(!name ? [{ field: 'name', message: 'Name is required' }] : []),
            ...(!shop_name ? [{ field: 'shop_name', message: 'Shop name is required' }] : []),
          ]);
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return Errors.validation(error.message);

        // Create merchant profile
        if (data.user) {
          await supabase.from('merchants').insert({
            id: data.user.id,
            name,
            shop_name,
            phone: email,
            language_preference: body.language_preference || 'en',
          });
        }

        return successResponse({ user: data.user }, undefined, 201);
      }

      case 'login': {
        const { email, password } = body;
        if (!email || !password) {
          return Errors.validation('Email and password are required');
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return Errors.unauthorized(error.message);

        return successResponse({ user: data.user, session: data.session });
      }

      case 'logout': {
        const { error } = await supabase.auth.signOut();
        if (error) return Errors.internal(error.message);
        return successResponse({ message: 'Logged out successfully' });
      }

      default:
        return Errors.validation('Invalid action. Use: signup, login, logout');
    }
  } catch (err) {
    console.error('Auth error:', err);
    return Errors.internal('Authentication failed');
  }
}

// ── GET /api/auth — Get current user (me) ─────────────────────────────────

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  return successResponse({
    id: auth.user.id,
    email: auth.user.email,
    merchant: auth.user.merchant,
  });
}
