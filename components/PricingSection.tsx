'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { PricingCard, type PricingTier } from '@/components/PricingCard';

const TIER_IDS = ['starter', 'pro', 'business'] as const;
type TierId = (typeof TIER_IDS)[number];

// Client-safe price id map (NEXT_PUBLIC_* vars are inlined at build time).
// We avoid importing `lib/stripe` here to keep the server SDK out of the bundle.
const PRICE_IDS: Record<TierId, string> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? '',
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? '',
  business: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS ?? '',
};

interface PricingSectionProps {
  /** When true, paid tiers trigger the real Stripe Checkout flow. */
  withCheckout?: boolean;
}

export function PricingSection({ withCheckout = false }: PricingSectionProps) {
  const t = useTranslations('Pricing');
  const locale = useLocale();
  const router = useRouter();

  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [errorId, setErrorId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = React.useState<string | null>(null);

  const tiers: PricingTier[] = TIER_IDS.map((id) => ({
    id,
    name: t(`tiers.${id}.name`),
    price: t(`tiers.${id}.price`),
    period: t('monthly'),
    description: t(`tiers.${id}.description`),
    features: t.raw(`tiers.${id}.features`) as string[],
    cta: t(`tiers.${id}.cta`),
    highlighted: id === 'pro',
    popularLabel: t('mostPopular'),
  }));

  // Load the signed-in user's current plan to highlight it.
  React.useEffect(() => {
    if (!withCheckout) return;
    let active = true;
    fetch('/api/me/subscription')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.signedIn) setCurrentPlan(data.plan ?? 'free');
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [withCheckout]);

  async function handleSelect(id: string) {
    setErrorId(null);
    setErrorMsg(null);

    // Homepage preview -> go to full pricing. Free tier -> sign up.
    if (!withCheckout) {
      router.push('/pricing');
      return;
    }
    if (id === 'starter') {
      router.push('/auth/signup');
      return;
    }

    const priceId = PRICE_IDS[id as TierId];
    setLoadingId(id);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, locale }),
      });

      if (res.status === 401) {
        // Not signed in — send to signup first.
        router.push('/auth/signup');
        return;
      }

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url; // -> Stripe Checkout
        return;
      }

      if (data.demo) {
        // No Stripe keys configured: simulate by routing to signup.
        router.push('/auth/signup');
        return;
      }

      throw new Error(data.error || t('error'));
    } catch (err) {
      setErrorId(id);
      setErrorMsg(err instanceof Error ? err.message : t('error'));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {tiers.map((tier) => (
        <PricingCard
          key={tier.id}
          tier={tier}
          loading={loadingId === tier.id}
          currentPlan={currentPlan}
          currentLabel={t('currentPlan')}
          error={errorId === tier.id ? errorMsg : null}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
