import { getTranslations } from 'next-intl/server';
import { Users, CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';
import { getAdminStats } from '@/lib/db';
import { AdminLayout, AdminForbidden } from '@/components/AdminLayout';
import { UserStats, type StatItem } from '@/components/UserStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

const money = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const [t, tp] = await Promise.all([
    getTranslations('Admin'),
    getTranslations('Plans'),
  ]);

  if (!admin) {
    return (
      <AdminForbidden
        title={t('forbidden.title')}
        message={t('forbidden.message')}
      />
    );
  }

  const stats = await getAdminStats();

  const items: StatItem[] = [
    {
      label: t('stats.totalUsers'),
      value: stats.totalUsers.toLocaleString(),
      icon: <Users />,
    },
    {
      label: t('stats.activeSubscriptions'),
      value: stats.activeSubscriptions.toLocaleString(),
      icon: <CreditCard />,
      tone: 'primary',
    },
    {
      label: t('stats.mrr'),
      value: money(stats.mrr),
      icon: <DollarSign />,
      tone: 'success',
    },
    {
      label: t('stats.totalRevenue'),
      value: money(stats.totalRevenue),
      icon: <TrendingUp />,
    },
  ];

  const planEntries = Object.entries(stats.byPlan);

  return (
    <AdminLayout title={t('nav.overview')}>
      <UserStats items={items} />

      <Card className="mt-6 max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">{t('stats.byPlan')}</CardTitle>
        </CardHeader>
        <CardContent>
          {planEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <ul className="space-y-3">
              {planEntries.map(([plan, count]) => {
                const total = stats.activeSubscriptions || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <li key={plan}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{tp(plan)}</span>
                      <span className="text-muted-foreground">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
