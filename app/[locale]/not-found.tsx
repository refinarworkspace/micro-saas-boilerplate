import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('Common');

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20 text-center">
      <p className="text-7xl font-extrabold tracking-tight text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        {t('notFoundTitle')}
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">{t('notFoundText')}</p>
      <Button className="mt-8" asChild>
        <Link href="/">{t('backHome')}</Link>
      </Button>
    </div>
  );
}
