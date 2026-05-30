import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEOHead';
import type { Locale } from '@/i18n/routing';
import { ColorConverterClient } from './ColorConverterClient';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  return buildMetadata({
    locale,
    title: `${messages.Tools.colorConverter.title} — ${messages.Common.appName}`,
    description: messages.Metadata.tools.colorConverter,
    path: '/tools/color-converter',
  });
}

export default function ColorConverterPage() {
  return <ColorConverterClient />;
}
