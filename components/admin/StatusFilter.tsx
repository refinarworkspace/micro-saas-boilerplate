'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

const STATUSES = [
  'all',
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
] as const;

/**
 * StatusFilter — a select that filters the subscriptions table by status via
 * the `?status=` query param (server re-renders with the filtered list).
 */
export function StatusFilter({ current }: { current: string }) {
  const t = useTranslations('Admin.subscriptions');
  const tps = useTranslations('PlanStatus');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = React.useTransition();

  function onChange(value: string) {
    const query = value === 'all' ? '' : `?status=${value}`;
    startTransition(() => {
      router.replace(`${pathname}${query}`);
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{t('filter')}</span>
      <select
        value={current}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s === 'all' ? t('all') : tps(s)}
          </option>
        ))}
      </select>
    </label>
  );
}
