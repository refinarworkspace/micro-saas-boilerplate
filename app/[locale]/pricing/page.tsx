import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { buildMetadata } from '@/components/SEOHead';
import { PricingSection } from '@/components/PricingSection';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  return buildMetadata({
    locale,
    title: `${messages.Pricing.title} — ${messages.Common.appName}`,
    description: messages.Pricing.subtitle,
    path: '/pricing',
  });
}

export default function PricingPage() {
  const t = useTranslations('Pricing');

  return (
    <div className="container py-14 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="mx-auto mt-12 max-w-5xl">
        {/* withCheckout enables the (placeholder) Stripe checkout flow. */}
        <PricingSection withCheckout />
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-sm text-muted-foreground">
        {t('faqNote')}
      </p>
    </div>
  );
}
