import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { ArrowRight, Image as ImageIcon, Palette, Type } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { buildMetadata } from '@/components/SEOHead';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = (await import(`@/i18n/messages/${locale}.json`)).default;
  return buildMetadata({
    locale,
    title: `${t.Tools.title} — ${t.Common.appName}`,
    description: t.Tools.subtitle,
    path: '/tools',
  });
}

export default function ToolsPage() {
  const t = useTranslations('Tools');

  const tools = [
    {
      href: '/tools/image-compressor',
      icon: ImageIcon,
      name: t('items.imageCompressor.name'),
      short: t('items.imageCompressor.short'),
    },
    {
      href: '/tools/markdown-preview',
      icon: Type,
      name: t('items.markdownPreview.name'),
      short: t('items.markdownPreview.short'),
    },
    {
      href: '/tools/color-converter',
      icon: Palette,
      name: t('items.colorConverter.name'),
      short: t('items.colorConverter.short'),
    },
  ];

  return (
    <div className="container py-14 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{tool.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {tool.short}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {t('tryIt')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
