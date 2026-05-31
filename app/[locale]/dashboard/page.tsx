import { getTranslations } from 'next-intl/server';
import { KeyRound, Wrench, CalendarClock, BadgeCheck } from 'lucide-react';
import { Link, redirect } from '@/i18n/routing';
import { DashboardLayout } from '@/components/DashboardLayout';
import { UserStats, type StatItem } from '@/components/UserStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth-server';
import { getSubscriptionByUserId, getUsageSummary } from '@/lib/db';

export const dynamic = 'force-dynamic';

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / 86_400_000) : 0;
}

function prettifyTool(id: string): string {
  return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const [t, tp, tps] = await Promise.all([
    getTranslations('Dashboard'),
    getTranslations('Plans'),
    getTranslations('PlanStatus'),
  ]);

  const sub = await getSubscriptionByUserId(user!.id);
  const usage = await getUsageSummary(user!.id);
  const plan = sub?.plan ?? 'free';
  const status = sub?.status ?? 'none';
  const days = daysUntil(sub?.current_period_end ?? null);

  const stats: StatItem[] = [
    {
      label: t('stats.toolsUsed'),
      value: usage.totalToolsUsed.toLocaleString(),
      hint: t('stats.toolsUsedHint'),
      icon: <Wrench />,
    },
    {
      label: t('stats.subscription'),
      value: tp(plan),
      hint: tps(status),
      tone: 'primary',
      icon: <BadgeCheck />,
    },
    {
      label: t('stats.daysRemaining'),
      value: days == null ? '—' : days,
      hint: t('stats.daysRemainingHint'),
      icon: <CalendarClock />,
    },
  ];

  return (
    <DashboardLayout title={t('nav.overview')}>
      {user!.isDemo && (
        <div className="mb-6 rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {t('demoBanner')}
        </div>
      )}

      {/* Stats */}
      <UserStats items={stats} />

      {/* Account info + recent usage */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('greeting')}, {user!.email}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label={t('email')} value={user!.email} />
            <Row label={t('role')} value={user!.role} />
            <Row label={t('stats.subscription')} value={tp(plan)} />
            <div className="pt-2">
              <Button asChild size="sm">
                <Link href="/account">{t('manageBilling')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('recentUsage')}</CardTitle>
          </CardHeader>
          <CardContent>
            {usage.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noUsage')}</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {usage.recent.map((u, i) => (
                  <li key={i} className="flex items-center justify-between py-2">
                    <span className="font-medium">{prettifyTool(u.tool)}</span>
                    <span className="text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API keys (placeholder) */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4" />
            {t('apiKeys.title')}
          </CardTitle>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            {t('apiKeys.comingSoon')}
          </span>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            {t('apiKeys.description')}
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={t('apiKeys.placeholder')}
              className="flex h-10 w-full rounded-md border border-input bg-muted/40 px-3 py-2 font-mono text-sm text-muted-foreground"
            />
            <Button variant="outline" disabled>
              {t('apiKeys.generate')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
