'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  FlaskConical,
  Gauge,
  Users,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * AdminLayout — sidebar shell for the admin panel.
 *
 * Usage (from a server page that has already verified `requireAdmin`):
 *   <AdminLayout title={t('nav.overview')}>...</AdminLayout>
 */

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: '/admin', labelKey: 'overview', icon: Gauge },
  { href: '/admin/users', labelKey: 'users', icon: Users },
  { href: '/admin/subscriptions', labelKey: 'subscriptions', icon: CreditCard },
  { href: '/admin/experiments', labelKey: 'experiments', icon: FlaskConical },
];

export function AdminLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const t = useTranslations('Admin.nav');
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div className="container py-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-60 lg:shrink-0">
          <div className="mb-4 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <FlaskConical className="h-3.5 w-3.5" />
            Admin
          </div>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {title && (
            <h1 className="mb-6 text-2xl font-bold tracking-tight">{title}</h1>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

/** Shown when a non-admin reaches an admin page. */
export function AdminForbidden({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-5xl">🔒</p>
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{message}</p>
    </div>
  );
}
