// ============================================================================
// Auth Middleware — JWT verification for API routes
// Source: SECURITY.md §Auth, API_SPEC.md §Authentication
// ============================================================================

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Errors } from '@/lib/api/response';
import type { Merchant } from '@/types';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  merchant?: Merchant;
}

/**
 * Verifies the user's session from the request cookies.
 * Returns the authenticated user or a NextResponse error.
 */
export async function getAuthenticatedUser(): Promise<
  { user: AuthenticatedUser; error?: never } | { user?: never; error: ReturnType<typeof Errors.unauthorized> }
> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { error: Errors.unauthorized('Missing or invalid authentication token') };
    }

    // Fetch merchant profile
    const { data: merchant } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      user: {
        id: user.id,
        email: user.email,
        merchant: merchant as Merchant | undefined,
      },
    };
  } catch {
    return { error: Errors.unauthorized('Authentication failed') };
  }
}
