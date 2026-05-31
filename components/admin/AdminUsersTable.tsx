'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Eye, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/useDebounce';
import type { AppUser, ListUsersResult } from '@/lib/db';

/**
 * AdminUsersTable — client table that calls GET /api/admin/users with search
 * and pagination, and shows per-user details in a dialog.
 */
export function AdminUsersTable() {
  const t = useTranslations('Admin.users');
  const tp = useTranslations('Plans');
  const tps = useTranslations('PlanStatus');

  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<ListUsersResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<AppUser | null>(null);
  const perPage = 10;

  const debouncedSearch = useDebounce(search, 350);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      search: debouncedSearch,
    });
    fetch(`/api/admin/users?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((json: ListUsersResult) => {
        if (active) setData(json);
      })
      .catch(() => active && setData({ users: [], total: 0, page, perPage }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, debouncedSearch]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / perPage)) : 1;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t('email')}</th>
              <th className="px-4 py-3 font-medium">{t('role')}</th>
              <th className="px-4 py-3 font-medium">{t('plan')}</th>
              <th className="px-4 py-3 font-medium">{t('status')}</th>
              <th className="px-4 py-3 font-medium">{t('joined')}</th>
              <th className="px-4 py-3 text-right font-medium">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  <span className="mt-2 block">{t('loading')}</span>
                </td>
              </tr>
            ) : data && data.users.length > 0 ? (
              data.users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3">{tp(u.plan)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={tps(u.status)} status={u.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(u)}
                    >
                      <Eye className="h-4 w-4" />
                      {t('view')}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {t('empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t('page')} {data?.page ?? page} {t('of')} {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t('prev')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {t('next')}
          </Button>
        </div>
      </div>

      {/* Details dialog */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('details')}</DialogTitle>
          </DialogHeader>
          {selected && (
            <dl className="mt-2 space-y-2 text-sm">
              <DetailRow label="ID" value={selected.id} mono />
              <DetailRow label={t('email')} value={selected.email} />
              <DetailRow label={t('role')} value={selected.role} />
              <DetailRow label={t('plan')} value={tp(selected.plan)} />
              <DetailRow label={t('status')} value={tps(selected.status)} />
              <DetailRow
                label={t('joined')}
                value={new Date(selected.created_at).toLocaleString()}
              />
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? 'font-mono text-xs' : 'font-medium'}>{value}</dd>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'admin';
  return (
    <span
      className={
        isAdmin
          ? 'rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
          : 'rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'
      }
    >
      {role}
    </span>
  );
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  const tone =
    status === 'active' || status === 'trialing'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : status === 'past_due'
        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
        : status === 'canceled'
          ? 'bg-destructive/10 text-destructive'
          : 'bg-muted text-muted-foreground';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}
