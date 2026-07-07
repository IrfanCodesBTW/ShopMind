// ============================================================================
// Proxy (Auth Redirect) — Next.js 16 proxy.ts (replaces middleware.ts)
// Source: SECURITY.md §Auth, proxy.md docs
// Redirects unauthenticated users away from protected routes.
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ['/', '/login'];

// Static assets and API routes to skip
const SKIP_PREFIXES = ['/_next', '/api', '/favicon'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, and image optimizations
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Proxy] Supabase environment variables are missing! Bypassing authentication check.');
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If authenticated user visits login, redirect to dashboard
    if (pathname === '/login') {
      const supabase = createSupabaseProxy(request);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes — check session
  const supabase = createSupabaseProxy(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Create a Supabase client suitable for use in the proxy layer.
 * Cannot use cookies() directly here — must use request/response objects.
 */
function createSupabaseProxy(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Proxy cannot set cookies — handled by the response
        },
      },
    }
  );
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
