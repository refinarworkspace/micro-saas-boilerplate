import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * -----------------------------------------------------------------------------
 * Server-side Supabase auth helpers
 * -----------------------------------------------------------------------------
 * Used by Server Components and Route Handlers to read the authenticated user
 * from the request cookies. In demo mode (no Supabase keys) `getCurrentUser`
 * returns a stable demo user so protected pages render without a backend.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('your-anon')
);

/** A demo user returned when Supabase is not configured. */
export const DEMO_USER = {
  id: 'usr_demo_admin',
  email: 'admin@example.com',
  role: 'admin' as const,
  isDemo: true,
};

export type CurrentUser = {
  id: string;
  email: string;
  role: 'user' | 'admin';
  isDemo?: boolean;
};

/**
 * Creates a request-scoped Supabase server client bound to Next.js cookies.
 * Returns `null` in demo mode.
 */
export function createServerSupabase(): SupabaseClient | null {
  if (!isAuthConfigured) return null;
  const cookieStore = cookies();
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
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
          // `set` throws when called from a Server Component render — safe to
          // ignore because the session is refreshed in middleware instead.
        }
      },
    },
  });
}

function toCurrentUser(user: User): CurrentUser {
  const role =
    (user.app_metadata?.role as 'admin' | 'user' | undefined) ??
    (user.user_metadata?.role as 'admin' | 'user' | undefined) ??
    'user';
  return { id: user.id, email: user.email ?? '', role };
}

/** Returns the authenticated user, the demo user, or `null`. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createServerSupabase();
  if (!supabase) {
    return { ...DEMO_USER };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? toCurrentUser(user) : null;
}
