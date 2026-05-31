'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  CreditCard,
  KeyRound,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * DashboardLayout — sidebar shell for all dashboard / account pages.
 *
 * Usage (from a server page):
 *   <DashboardLayout title={t('nav.overview')}>
 *     ...page content...
 *   </DashboardLayout>
 *
 * The sidebar highlights the active route using the locale-aware pathname.
 */

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: '/dashboard', labelKey: 'overview', icon: LayoutDashboard },
  { href: '/account', labelKey: 'billing', icon: CreditCard },
  { href: '/dashboard/api-keys', labelKey: 'apiKeys', icon: KeyRound },
  { href: '/dashboard/settings', labelKey: 'settings', icon: Settings },
];

export function DashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const t = useTranslations('Dashboard.nav');
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div className="container py-8 lg:py-12">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-60 lg:shrink-0">
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

        {/* Content */}
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
