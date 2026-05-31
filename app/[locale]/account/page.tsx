import { getTranslations } from 'next-intl/server';
import { CheckCircle2 } from 'lucide-react';
import { Link, redirect } from '@/i18n/routing';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth-server';
import { getSubscriptionByUserId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { checkout?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const [t, tp, tps] = await Promise.all([
    getTranslations('Account'),
    getTranslations('Plans'),
    getTranslations('PlanStatus'),
  ]);

  const sub = await getSubscriptionByUserId(user!.id);
  const plan = sub?.plan ?? 'free';
  const status = sub?.status ?? 'none';
  const isFree = plan === 'free';
  const success = searchParams?.checkout === 'success';

  return (
    <DashboardLayout title={t('title')}>
      <p className="-mt-3 mb-6 text-muted-foreground">{t('subtitle')}</p>

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          {t('checkoutSuccess')}
        </div>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">{t('currentPlan')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{tp(plan)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('status')}: {tps(status)}
              </p>
            </div>
            {sub?.current_period_end && (
              <p className="text-sm text-muted-foreground">
                {t('renewsOn')}{' '}
                {new Date(sub.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>

          {isFree ? (
            <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {t('noSubscription')}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-2">
            {isFree ? (
              <Button asChild>
                <Link href="/pricing">{t('viewPlans')}</Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                {t('manageBilling')}
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link href="/dashboard">{t('backToDashboard')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
