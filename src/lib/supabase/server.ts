// ============================================================================
// Supabase Server Client (service role, server-only)
// Source: ARCHITECTURE.md §Backend/API, SECURITY.md §API Key Management
// ============================================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for use in Server Components and Route Handlers.
 * Uses the anon key + user's JWT from cookies for RLS-scoped access.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components (read-only context)
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase admin client with the service_role key.
 * ONLY for server-side operations that need to bypass RLS (e.g., api_usage logging).
 * NEVER expose this client or its key to the browser.
 */
export function createAdminSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}
