'use client';

import { useTranslations } from 'next-intl';
import { Rocket } from 'lucide-react';
import { Link } from '@/i18n/routing';

export function Footer() {
  const t = useTranslations('Footer');
  const tc = useTranslations('Common');
  const year = new Date().getFullYear();

  const columns: { title: string; links: { label: string; href: string }[] }[] =
    [
      {
        title: t('product'),
        links: [
          { label: t('links.features'), href: '/#features' },
          { label: t('links.pricing'), href: '/pricing' },
          { label: t('links.tools'), href: '/tools' },
          { label: t('links.changelog'), href: '/#' },
        ],
      },
      {
        title: t('company'),
        links: [
          { label: t('links.about'), href: '/#' },
          { label: t('links.blog'), href: '/#' },
          { label: t('links.careers'), href: '/#' },
          { label: t('links.contact'), href: '/#' },
        ],
      },
      {
        title: t('resources'),
        links: [
          { label: t('links.docs'), href: '/#' },
          { label: t('links.support'), href: '/#' },
          { label: t('links.status'), href: '/#' },
        ],
      },
      {
        title: t('legal'),
        links: [
          { label: t('links.privacy'), href: '/#' },
          { label: t('links.terms'), href: '/#' },
        ],
      },
    ];

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold tracking-tight"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Rocket className="h-4 w-4" />
              </span>
              <span className="text-lg">{tc('appName')}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>
            &copy; {year} {tc('appName')}. {t('rights')}
          </p>
          <p>{t('builtWith')}</p>
        </div>
      </div>
    </footer>
  );
}
