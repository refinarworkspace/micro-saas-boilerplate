import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

interface BuildMetadataOptions {
  locale: Locale;
  /** Page-specific title. Falls back to the default site title. */
  title?: string;
  /** Page-specific description. Falls back to the default site description. */
  description?: string;
  /** Path without the locale prefix, e.g. "/tools/color-converter". */
  path?: string;
  /** Absolute or relative OG image URL. */
  image?: string;
}

/**
 * Reusable metadata builder used by every page's `generateMetadata` export.
 * Produces a fully populated Next.js `Metadata` object including Open Graph
 * and Twitter card tags, canonical URL and locale alternates.
 *
 * Example:
 *   export async function generateMetadata({ params: { locale } }) {
 *     return buildMetadata({ locale, title: '…', description: '…', path: '/tools' });
 *   }
 */
export async function buildMetadata({
  locale,
  title,
  description,
  path = '',
  image = '/og-image.svg',
}: BuildMetadataOptions): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const resolvedTitle = title ?? t('defaultTitle');
  const resolvedDescription = description ?? t('defaultDescription');
  const siteName = t('siteName');
  const url = `${APP_URL}/${locale}${path}`;
  const ogImage = image.startsWith('http') ? image : `${APP_URL}${image}`;

  return {
    metadataBase: new URL(APP_URL),
    title: resolvedTitle,
    description: resolvedDescription,
    applicationName: siteName,
    alternates: {
      canonical: url,
      languages: {
        en: `${APP_URL}/en${path}`,
        zh: `${APP_URL}/zh${path}`,
        es: `${APP_URL}/es${path}`,
      },
    },
    openGraph: {
      type: 'website',
      url,
      title: resolvedTitle,
      description: resolvedDescription,
      siteName,
      locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: resolvedTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Convenience alias matching the requested `generateMetadata` naming.
 */
export const generateMetadata = buildMetadata;
