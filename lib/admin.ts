import { getCurrentUser, type CurrentUser } from './auth-server';

/**
 * -----------------------------------------------------------------------------
 * Admin role verification
 * -----------------------------------------------------------------------------
 * The "admin" role is read from Supabase user metadata. We check, in order:
 *   1. `app_metadata.role === 'admin'` (set server-side, most trustworthy)
 *   2. `user_metadata.role === 'admin'`
 * Both are surfaced via `getCurrentUser()`.
 *
 * For finer-grained control you can instead maintain a `user_roles` table
 * (see database-schema.sql) and look the role up there.
 */

export function isAdmin(user: CurrentUser | null): boolean {
  return user?.role === 'admin';
}

/**
 * Returns the current user if they are an admin, otherwise `null`.
 * Use in Server Components / Route Handlers to gate admin-only resources.
 */
export async function requireAdmin(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  return isAdmin(user) ? user : null;
}
