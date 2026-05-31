import { getTranslations } from 'next-intl/server';
import { requireAdmin } from '@/lib/admin';
import { listSubscriptions } from '@/lib/db';
import { AdminLayout, AdminForbidden } from '@/components/AdminLayout';
import { StatusFilter } from '@/components/admin/StatusFilter';

export const dynamic = 'force-dynamic';

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const admin = await requireAdmin();
  const [t, tp, tps] = await Promise.all([
    getTranslations('Admin'),
    getTranslations('Plans'),
    getTranslations('PlanStatus'),
  ]);

  if (!admin) {
    return (
      <AdminForbidden
        title={t('forbidden.title')}
        message={t('forbidden.message')}
      />
    );
  }

  const status = searchParams?.status ?? 'all';
  const subs = await listSubscriptions(status);

  return (
    <AdminLayout title={t('subscriptions.title')}>
      <div className="mb-4 flex justify-end">
        <StatusFilter current={status} />
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t('subscriptions.customer')}</th>
              <th className="px-4 py-3 font-medium">{t('subscriptions.plan')}</th>
              <th className="px-4 py-3 font-medium">{t('subscriptions.status')}</th>
              <th className="px-4 py-3 font-medium">{t('subscriptions.renews')}</th>
              <th className="px-4 py-3 font-medium">{t('subscriptions.created')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  {t('subscriptions.empty')}
                </td>
              </tr>
            ) : (
              subs.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">
                    {s.stripe_customer_id ?? s.user_id}
                  </td>
                  <td className="px-4 py-3">{tp(s.plan)}</td>
                  <td className="px-4 py-3">{tps(s.status)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.current_period_end
                      ? new Date(s.current_period_end).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
