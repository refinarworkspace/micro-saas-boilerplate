import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEOHead';
import type { Locale } from '@/i18n/routing';
import { ImageCompressorClient } from './ImageCompressorClient';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  return buildMetadata({
    locale,
    title: `${messages.Tools.imageCompressor.title} — ${messages.Common.appName}`,
    description: messages.Metadata.tools.imageCompressor,
    path: '/tools/image-compressor',
  });
}

export default function ImageCompressorPage() {
  return <ImageCompressorClient />;
}
