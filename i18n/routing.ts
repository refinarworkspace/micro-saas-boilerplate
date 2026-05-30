import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const locales = ['en', 'zh', 'es'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  es: 'Español',
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

// Lightweight wrappers around Next.js navigation APIs that are aware of the
// active locale. Import these instead of the ones from `next/link` / `next/navigation`.
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
