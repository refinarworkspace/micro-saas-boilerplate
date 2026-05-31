import { getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const t = await getTranslations('Dashboard');

  return (
    <DashboardLayout title={t('nav.settings')}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('settings.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t('settings.description')}</p>
          <p className="rounded-md bg-muted/40 px-3 py-2">
            {t('settings.comingSoon')}
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
