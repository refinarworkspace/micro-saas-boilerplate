import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * UserStats — a row of stat cards for the dashboard overview.
 *
 * Usage:
 *   <UserStats
 *     items={[
 *       { label: 'Tools used', value: 128, hint: 'Across all tools', icon: <Wrench /> },
 *       { label: 'Subscription', value: 'Pro', tone: 'primary' },
 *       { label: 'Days remaining', value: 30, hint: 'Until renewal' },
 *     ]}
 *   />
 *
 * Purely presentational (server-component friendly) — pass already-translated
 * labels/values as props.
 */

export interface StatItem {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const toneClasses: Record<NonNullable<StatItem['tone']>, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  danger: 'text-destructive',
};

export function UserStats({ items }: { items: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <Card key={i}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
            {item.icon && (
              <span className="text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
                {item.icon}
              </span>
            )}
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                toneClasses[item.tone ?? 'default']
              )}
            >
              {item.value}
            </div>
            {item.hint && (
              <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
