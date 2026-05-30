import { createBrowserClient } from '@supabase/ssr';

/**
 * -----------------------------------------------------------------------------
 * Supabase client (PLACEHOLDER)
 * -----------------------------------------------------------------------------
 * This is a thin wrapper around the Supabase JS SDK. It is intentionally a
 * placeholder: the auth pages call into it, but until you provide real
 * credentials in `.env.local` it will run in a safe "demo" mode that simply
 * resolves without contacting a backend.
 *
 * To go live:
 *   1. Create a project at https://app.supabase.com
 *   2. Copy the URL + anon key into `.env.local`
 *   3. Delete the demo guards below — the real client will take over.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('your-anon')
);

/**
 * Returns a browser Supabase client. When the project is not yet configured,
 * we return `null` so callers can fall back to demo behaviour.
 */
export function createClient() {
  if (!isSupabaseConfigured) {
    return null;
  }
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

export type AuthResult = {
  success: boolean;
  message?: string;
};

/**
 * Sign in with email + password. Falls back to a simulated success in demo mode.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    // Demo mode — pretend everything worked so the UI is explorable.
    await new Promise((r) => setTimeout(r, 600));
    return { success: true, message: 'demo' };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { success: !error, message: error?.message };
}

/**
 * Sign up with email + password.
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    await new Promise((r) => setTimeout(r, 600));
    return { success: true, message: 'demo' };
  }
  const { error } = await supabase.auth.signUp({ email, password });
  return { success: !error, message: error?.message };
}

/**
 * Start the Google OAuth flow.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) {
    await new Promise((r) => setTimeout(r, 600));
    return { success: true, message: 'demo' };
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });
  return { success: !error, message: error?.message };
}
