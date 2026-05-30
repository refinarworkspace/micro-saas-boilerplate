import Stripe from 'stripe';

/**
 * -----------------------------------------------------------------------------
 * Stripe integration (PLACEHOLDER)
 * -----------------------------------------------------------------------------
 * Server-side Stripe SDK instance plus helpers used by the pricing page and the
 * webhook route. Like the Supabase client, this is wired up but runs in a safe
 * "demo" mode until you supply real keys in `.env.local`.
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const isStripeConfigured = Boolean(
  stripeSecretKey && !stripeSecretKey.includes('xxxxx')
);

/**
 * Lazily-created server Stripe instance. Returns `null` in demo mode so the
 * webhook / checkout stubs can respond without throwing.
 */
export const stripe: Stripe | null = isStripeConfigured
  ? new Stripe(stripeSecretKey!, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  : null;

/**
 * Map of logical plan IDs to Stripe price IDs (set these in `.env.local`).
 */
export const PRICE_IDS = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? '',
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? '',
  business: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS ?? '',
} as const;

export type PlanId = keyof typeof PRICE_IDS;
