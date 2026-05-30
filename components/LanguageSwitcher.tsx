'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Languages } from 'lucide-react';
import { usePathname, useRouter, locales, localeNames, type Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Language switcher that preserves the current pathname while changing the
 * `[locale]` segment. Uses the locale-aware router from `@/i18n/routing`.
 */
export function LanguageSwitcher() {
  const t = useTranslations('Language');
  const activeLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function changeLocale(next: Locale) {
    setOpen(false);
    startTransition(() => {
      // `pathname` here excludes the locale prefix, so the router re-adds it.
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('label')}
        disabled={isPending}
        onClick={() => setOpen((o) => !o)}
      >
        <Languages className="h-5 w-5" />
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-fade-in">
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => changeLocale(loc)}
              className={cn(
                'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                activeLocale === loc && 'font-medium'
              )}
            >
              <span>{localeNames[loc]}</span>
              {activeLocale === loc && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
