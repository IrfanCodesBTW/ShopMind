// ============================================================================
// Supabase Browser Client (public, anon key)
// Source: ARCHITECTURE.md §Database, SECURITY.md §API Key Management
// ============================================================================

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
