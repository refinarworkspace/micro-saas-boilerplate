import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { getAdminStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stats
 * Admin-only. Returns aggregate dashboard stats.
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const stats = await getAdminStats();
  return NextResponse.json(stats);
}
