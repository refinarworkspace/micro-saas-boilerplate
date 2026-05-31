import { NextResponse, type NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { listUsers } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users?page=1&perPage=10&search=
 * Admin-only. Returns a paginated, searchable list of users.
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const perPage = Math.min(
    100,
    Math.max(1, Number(searchParams.get('perPage') ?? '10') || 10)
  );
  const search = searchParams.get('search') ?? '';

  const result = await listUsers({ page, perPage, search });
  return NextResponse.json(result);
}
