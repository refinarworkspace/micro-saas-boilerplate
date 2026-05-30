'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { PricingCard, type PricingTier } from '@/components/PricingCard';
import { startCheckout } from '@/lib/checkout';

const TIER_IDS = ['starter', 'pro', 'business'] as const;

interface PricingSectionProps {
  /**
   * When true, the paid tiers trigger the (placeholder) Stripe checkout flow.
   * When false (e.g. on the homepage preview) they navigate to /pricing.
   */
  withCheckout?: boolean;
}

export function PricingSection({ withCheckout = false }: PricingSectionProps) {
  const t = useTranslations('Pricing');
  const router = useRouter();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

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

  async function handleSelect(id: string) {
    // Free tier (or homepage preview) just routes the user along.
    if (!withCheckout || id === 'starter') {
      router.push(id === 'starter' ? '/auth/signup' : '/pricing');
      return;
    }

    setLoadingId(id);
    setNotice(t('checkout'));
    const { url } = await startCheckout(id);
    if (url) {
      window.location.href = url;
      return;
    }
    // Demo mode: no real session, so send the user to sign up.
    setLoadingId(null);
    router.push('/auth/signup');
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-3 md:gap-6">
        {tiers.map((tier) => (
          <PricingCard
            key={tier.id}
            tier={tier}
            loading={loadingId === tier.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
      {notice && (
        <p className="mt-6 text-center text-sm text-muted-foreground" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
