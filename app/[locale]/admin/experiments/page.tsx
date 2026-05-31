import { getTranslations } from 'next-intl/server';
import { requireAdmin } from '@/lib/admin';
import { getAbResults, type AbResultRow } from '@/lib/db';
import { AdminLayout, AdminForbidden } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AdminExperimentsPage() {
  const admin = await requireAdmin();
  const t = await getTranslations('Admin');

  if (!admin) {
    return (
      <AdminForbidden
        title={t('forbidden.title')}
        message={t('forbidden.message')}
      />
    );
  }

  const results = await getAbResults();

  // Group rows by experiment.
  const byExperiment = new Map<string, AbResultRow[]>();
  for (const row of results) {
    const arr = byExperiment.get(row.experiment_name) ?? [];
    arr.push(row);
    byExperiment.set(row.experiment_name, arr);
  }

  const experiments = Array.from(byExperiment.entries());

  return (
    <AdminLayout title={t('experiments.title')}>
      <p className="-mt-3 mb-6 text-muted-foreground">
        {t('experiments.subtitle')}
      </p>

      {experiments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('experiments.empty')}</p>
      ) : (
        <div className="space-y-6">
          {experiments.map(([name, rows]) => {
            const leader = rows.reduce(
              (best, r) => (r.rate > best.rate ? r : best),
              rows[0]
            );
            return (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="font-mono text-base">{name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="py-2 font-medium">
                            {t('experiments.variant')}
                          </th>
                          <th className="py-2 font-medium">
                            {t('experiments.exposures')}
                          </th>
                          <th className="py-2 font-medium">
                            {t('experiments.conversions')}
                          </th>
                          <th className="py-2 font-medium">
                            {t('experiments.rate')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {rows.map((r) => {
                          const isLeader =
                            r.variant === leader.variant && rows.length > 1;
                          return (
                            <tr key={r.variant}>
                              <td className="py-2 font-medium">
                                {r.variant}
                                {isLeader && (
                                  <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    {t('experiments.winner')}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 tabular-nums">
                                {r.exposures.toLocaleString()}
                              </td>
                              <td className="py-2 tabular-nums">
                                {r.conversions.toLocaleString()}
                              </td>
                              <td className="py-2 font-semibold tabular-nums">
                                {r.rate.toFixed(2)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
