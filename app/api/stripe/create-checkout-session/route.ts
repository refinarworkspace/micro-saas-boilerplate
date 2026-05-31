import { NextResponse, type NextRequest } from 'next/server';
import { stripe, getOrCreateCustomer } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/create-checkout-session
 * Body: { priceId: string, locale?: string }
 *
 * Creates a Stripe Checkout Session (subscription mode) and returns its URL.
 * Success -> /[locale]/account, Cancel -> /[locale]/pricing.
 *
 * In demo mode (no STRIPE_SECRET_KEY) it returns `{ url: null, demo: true }`
 * so the client can gracefully fall back.
 */
export async function POST(req: NextRequest) {
  let body: { priceId?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { priceId, locale = 'en' } = body;
  if (!priceId) {
    return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    req.headers.get('origin') ||
    new URL(req.url).origin;

  // ----- Demo mode -----------------------------------------------------------
  if (!stripe) {
    return NextResponse.json({ url: null, demo: true });
  }

  // ----- Authenticated checkout ---------------------------------------------
  const user = await getCurrentUser();
  if (!user || user.isDemo) {
    return NextResponse.json(
      { error: 'You must be signed in to subscribe.' },
      { status: 401 }
    );
  }

  try {
    const customerId = await getOrCreateCustomer({
      email: user.email,
      userId: user.id,
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId ?? undefined,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/${locale}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/pricing?checkout=cancel`,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('[stripe] create-checkout-session', message);
    return NextResponse.json(
      { error: 'Could not create checkout session.' },
      { status: 500 }
    );
  }
}
