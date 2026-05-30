import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { stripe, isStripeConfigured } from '@/lib/stripe';

// Stripe needs the raw request body to verify the signature, so this route
// must not be statically optimized.
export const dynamic = 'force-dynamic';

/**
 * -----------------------------------------------------------------------------
 * Stripe webhook handler (STUB)
 * -----------------------------------------------------------------------------
 * Configure the endpoint in the Stripe dashboard:
 *   https://your-domain.com/api/stripe-webhook
 * and copy the signing secret into STRIPE_WEBHOOK_SECRET.
 *
 * In demo mode (no keys configured) the handler simply acknowledges receipt so
 * you can wire up the rest of the flow without errors.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // ----- Demo mode -----------------------------------------------------------
  if (!isStripeConfigured || !stripe || !webhookSecret || !signature) {
    // eslint-disable-next-line no-console
    console.info('[stripe-webhook] Received event in demo mode (not verified).');
    return NextResponse.json({ received: true, demo: true });
  }

  // ----- Verified mode -------------------------------------------------------
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: mark the user/customer as subscribed in your database.
      // eslint-disable-next-line no-console
      console.info('[stripe-webhook] checkout.session.completed', session.id);
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      // TODO: sync subscription status (active / canceled / past_due).
      // eslint-disable-next-line no-console
      console.info(`[stripe-webhook] ${event.type}`, subscription.id);
      break;
    }
    default:
      // eslint-disable-next-line no-console
      console.info(`[stripe-webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
