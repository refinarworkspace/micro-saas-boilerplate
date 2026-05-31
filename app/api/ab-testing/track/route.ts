import { NextResponse, type NextRequest } from 'next/server';
import { recordAbEvent } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ab-testing/track
 * Body: { experiment: string, variant: string, event: string }
 *
 * Records an A/B testing event (exposure / conversion / custom). Associates it
 * with the current user when signed in.
 */
export async function POST(req: NextRequest) {
  let body: { experiment?: string; variant?: string; event?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { experiment, variant, event } = body;
  if (!experiment || !variant || !event) {
    return NextResponse.json(
      { error: 'experiment, variant and event are required' },
      { status: 400 }
    );
  }

  let userId: string | null = null;
  try {
    const user = await getCurrentUser();
    userId = user && !user.isDemo ? user.id : null;
  } catch {
    /* anonymous */
  }

  try {
    await recordAbEvent({
      experimentName: experiment,
      variant,
      event,
      userId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('[ab-testing] track', message);
    return NextResponse.json({ error: 'Could not record event' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
