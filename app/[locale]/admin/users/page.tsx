import { getTranslations } from 'next-intl/server';
import { requireAdmin } from '@/lib/admin';
import { AdminLayout, AdminForbidden } from '@/components/AdminLayout';
import { AdminUsersTable } from '@/components/admin/AdminUsersTable';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
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

  return (
    <AdminLayout title={t('users.title')}>
      <AdminUsersTable />
    </AdminLayout>
  );
}
