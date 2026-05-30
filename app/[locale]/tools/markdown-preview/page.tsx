import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEOHead';
import type { Locale } from '@/i18n/routing';
import { MarkdownPreviewClient } from './MarkdownPreviewClient';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  return buildMetadata({
    locale,
    title: `${messages.Tools.markdownPreview.title} — ${messages.Common.appName}`,
    description: messages.Metadata.tools.markdownPreview,
    path: '/tools/markdown-preview',
  });
}

export default function MarkdownPreviewPage() {
  return <MarkdownPreviewClient />;
}
