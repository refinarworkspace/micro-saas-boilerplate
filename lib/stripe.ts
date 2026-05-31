import Stripe from 'stripe';

/**
 * -----------------------------------------------------------------------------
 * Stripe server-side client
 * -----------------------------------------------------------------------------
 * Initializes the Stripe SDK with proper typing. Runs in a safe "demo" mode
 * (exported `stripe` is `null`) until you provide a real `STRIPE_SECRET_KEY`
 * in `.env.local`, so the rest of the app keeps working without keys.
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const isStripeConfigured = Boolean(
  stripeSecretKey && !stripeSecretKey.includes('xxxxx')
);

/** Lazily-created server Stripe instance. `null` in demo mode. */
export const stripe: Stripe | null = isStripeConfigured
  ? new Stripe(stripeSecretKey!, {
      apiVersion: '2024-06-20',
      typescript: true,
      appInfo: { name: 'micro-saas-boilerplate', version: '2.0.0' },
    })
  : null;

/** Logical plan IDs -> Stripe price IDs (set these in `.env.local`). */
export const PRICE_IDS = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? '',
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? '',
  business: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS ?? '',
} as const;

export type PlanId = keyof typeof PRICE_IDS;

/** Monthly amount (USD) per plan — used for MRR/revenue estimates in admin. */
export const PLAN_AMOUNTS: Record<PlanId, number> = {
  starter: 0,
  pro: 19,
  business: 49,
};

/** Resolve a logical plan id from a Stripe price id (reverse of PRICE_IDS). */
export function planForPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  const entry = (Object.entries(PRICE_IDS) as [PlanId, string][]).find(
    ([, value]) => value === priceId
  );
  return entry ? entry[0] : null;
}

/** Resolve the Stripe price id for a logical plan id. */
export function priceIdForPlan(plan: string): string | null {
  if (plan in PRICE_IDS) {
    const id = PRICE_IDS[plan as PlanId];
    return id || null;
  }
  return null;
}

/**
 * Find an existing Stripe customer by email, or create a new one tagged with
 * the Supabase user id. Returns `null` in demo mode.
 */
export async function getOrCreateCustomer(params: {
  email: string;
  userId: string;
}): Promise<string | null> {
  if (!stripe) return null;
  const { email, userId } = params;

  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });
  return customer.id;
}
