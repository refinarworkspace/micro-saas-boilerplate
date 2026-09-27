'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Menu, Rocket, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';

export function Header() {
  const t = useTranslations('Nav');
  const tc = useTranslations('Common');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/tools', label: t('tools') },
    { href: '/pricing', label: t('pricing') },
    { href: '/dashboard', label: t('dashboard') },
  ];

  // Close the mobile menu whenever the route changes.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between gap-2 px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-bold tracking-tight"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Rocket className="h-4 w-4" />
          </span>
          <span className="min-w-0 truncate text-base sm:text-lg">{tc('appName')}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-foreground'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex shrink-0 items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">{t('login')}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signup">{t('signup')}</Link>
            </Button>
          </div>

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-4">
              <Button variant="outline" asChild>
                <Link href="/auth/login">{t('login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">{t('signup')}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
