import { getTranslations } from 'next-intl/server';
import { KeyRound } from 'lucide-react';
import { redirect } from '@/i18n/routing';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export default async function ApiKeysPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const t = await getTranslations('Dashboard');

  return (
    <DashboardLayout title={t('nav.apiKeys')}>
      <Card>
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
