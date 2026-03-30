// ---------------------------------------------------------------------------
// Supabase client initialisation
// lib/supabase.ts
//
// Exports:
//   supabase          — browser / client-side singleton (anon key)
//   createServerClient — factory for server-side requests (cookies-aware, SSR)
// ---------------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js';
import { createServerClient as createSSRServerClient, type CookieOptions } from '@supabase/ssr';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// ---------------------------------------------------------------------------
// Environment variable validation
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// ---------------------------------------------------------------------------
// Browser / client-side Supabase client (singleton)
// Use in Client Components and API routes that don't need cookie-based auth.
// ---------------------------------------------------------------------------

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// Server-side Supabase client factory (cookie-aware)
// Use in Server Components, Server Actions, and API Route Handlers.
//
// Usage in a Server Component:
//   import { cookies } from 'next/headers';
//   import { createServerClient } from '@/lib/supabase';
//   const client = createServerClient(cookies());
// ---------------------------------------------------------------------------

export function createServerClient(cookieStore: ReadonlyRequestCookies) {
  return createSSRServerClient(supabaseUrl as string, supabaseAnonKey as string, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          // @ts-expect-error — ReadonlyRequestCookies.set exists at runtime in Next.js ≥14
          cookieStore.set({ name, value, ...options });
        } catch {
          // set() is a no-op in Server Components; handled by middleware
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          // @ts-expect-error — ReadonlyRequestCookies.set exists at runtime in Next.js ≥14
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // remove() is a no-op in Server Components; handled by middleware
        }
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Service-role client (server-only — never import in client components)
// Only used in API routes / Server Actions that require elevated permissions.
// ---------------------------------------------------------------------------

/**
 * Returns a Supabase client authenticated with the service-role key.
 * NEVER call this in a Client Component or expose it to the browser.
 */
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl as string, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
