import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';
import { getSubscriptionByUserId } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/me/subscription
 * Returns the current user's plan + status (or nulls when signed out).
 * Used by the pricing page to highlight the user's current plan.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ plan: null, status: null, signedIn: false });
  }
  const sub = await getSubscriptionByUserId(user.id);
  return NextResponse.json({
    plan: sub?.plan ?? 'free',
    status: sub?.status ?? 'none',
    signedIn: true,
  });
}
