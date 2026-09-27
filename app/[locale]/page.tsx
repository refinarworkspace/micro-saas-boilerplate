import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Globe,
  Image as ImageIcon,
  Palette,
  Shield,
  Sparkles,
  Type,
  Zap,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { PricingSection } from '@/components/PricingSection';
import { FaqAccordion, type FaqItem } from '@/components/FaqAccordion';
import { buildMetadata } from '@/components/SEOHead';
import type { Locale } from '@/i18n/routing';

const FEATURE_ICONS = {
  zap: Zap,
  globe: Globe,
  shield: Shield,
} as const;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  return buildMetadata({ locale, path: '' });
}

export default function HomePage() {
  const t = useTranslations('Home');
  const tt = useTranslations('Tools');

  const features = t.raw('features.items') as {
    icon: keyof typeof FEATURE_ICONS;
    title: string;
    description: string;
  }[];
  const faqItems = t.raw('faq.items') as FaqItem[];

  const toolPreviews = [
    {
      href: '/tools/image-compressor',
      icon: ImageIcon,
      name: tt('items.imageCompressor.name'),
      short: tt('items.imageCompressor.short'),
    },
    {
      href: '/tools/markdown-preview',
      icon: Type,
      name: tt('items.markdownPreview.name'),
      short: tt('items.markdownPreview.short'),
    },
    {
      href: '/tools/color-converter',
      icon: Palette,
      name: tt('items.colorConverter.name'),
      short: tt('items.colorConverter.short'),
    },
  ];

  return (
    <>
      {/* ----------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="container flex flex-col items-center px-4 py-14 text-center sm:px-6 sm:py-20 lg:py-28">
          <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border bg-background/60 px-3 py-1.5 text-center text-sm font-medium text-muted-foreground shadow-sm backdrop-blur sm:px-4">
            <Sparkles className="h-4 w-4 shrink-0 text-primary" />
            {t('badge')}
          </span>

          <h1 className="mt-6 w-full max-w-4xl break-words text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t('headline')}
          </h1>

          <p className="mt-6 w-full max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t('subtext')}
          </p>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:mt-9 sm:w-auto sm:max-w-none sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/auth/signup">
                {t('ctaPrimary')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/tools">{t('ctaSecondary')}</Link>
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">{t('trustedBy')}</p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Features                                                          */}
      {/* ----------------------------------------------------------------- */}
      <section id="features" className="container py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('features.title')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('features.subtitle')}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon] ?? Zap;
            return (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Tools preview                                                     */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">{tt('title')}</h2>
            <p className="mt-3 text-muted-foreground">{tt('subtitle')}</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {toolPreviews.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 flex items-center gap-1 text-lg font-semibold">
                    {tool.name}
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {tool.short}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Pricing preview                                                   */}
      {/* ----------------------------------------------------------------- */}
      <section id="pricing" className="container py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('pricing.title')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('pricing.subtitle')}</p>
        </div>
        <div className="mt-12">
          <PricingSection withCheckout={false} />
        </div>
        <div className="mt-8 text-center">
          <Button variant="link" asChild>
            <Link href="/pricing">
              {t('pricing.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* FAQ                                                               */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="container py-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('faq.title')}
            </h2>
            <p className="mt-3 text-muted-foreground">{t('faq.subtitle')}</p>
          </div>
          <div className="mt-10">
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* CTA banner                                                        */}
      {/* ----------------------------------------------------------------- */}
      <section className="container py-16 lg:py-24">
        <div className="glow relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <div className="absolute inset-0 -z-0 bg-grid opacity-20" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('ctaBanner.title')}
            </h2>
            <p className="mt-4 text-primary-foreground/90">
              {t('ctaBanner.subtitle')}
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/signup">
                  {t('ctaBanner.button')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
