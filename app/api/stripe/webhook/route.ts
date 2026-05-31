import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { stripe, isStripeConfigured, planForPriceId } from '@/lib/stripe';
import {
  upsertSubscription,
  updateSubscriptionByStripeId,
  type SubscriptionStatus,
} from '@/lib/db';

// Stripe needs the raw body to verify the signature.
export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/webhook
 *
 * Handles:
 *  - checkout.session.completed      -> create/refresh the subscription row
 *  - customer.subscription.updated   -> sync plan + status + period end
 *  - customer.subscription.deleted   -> mark canceled
 *
 * Configure the endpoint URL in the Stripe dashboard and put the signing
 * secret in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // ----- Demo mode -----------------------------------------------------------
  if (!isStripeConfigured || !stripe || !webhookSecret || !signature) {
    // eslint-disable-next-line no-console
    console.info('[stripe webhook] Received event in demo mode (not verified).');
    return NextResponse.json({ received: true, demo: true });
  }

  // ----- Verify --------------------------------------------------------------
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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.metadata?.user_id ?? session.client_reference_id ?? null;
        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await upsertSubscription({
            user_id: userId,
            stripe_customer_id: (session.customer as string) ?? null,
            stripe_subscription_id: subscription.id,
            plan: planForPriceId(subscription.items.data[0]?.price.id) ?? 'free',
            status: subscription.status as SubscriptionStatus,
            current_period_end: toIso(subscription.current_period_end),
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const patch = {
          plan: planForPriceId(subscription.items.data[0]?.price.id) ?? 'free',
          status: subscription.status as SubscriptionStatus,
          current_period_end: toIso(subscription.current_period_end),
          stripe_customer_id: (subscription.customer as string) ?? null,
        };
        // Prefer upsert by user when we have it; otherwise patch by stripe id.
        if (userId) {
          await upsertSubscription({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            ...patch,
          });
        } else {
          await updateSubscriptionByStripeId(subscription.id, patch);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionByStripeId(subscription.id, {
          status: 'canceled',
          plan: 'free',
        });
        break;
      }

      default:
        // eslint-disable-next-line no-console
        console.info(`[stripe webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('[stripe webhook] handler error', message);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function toIso(unixSeconds: number | null | undefined): string | null {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}
