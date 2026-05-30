import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEOHead';
import type { Locale } from '@/i18n/routing';
import { LoginForm } from './LoginForm';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  return buildMetadata({
    locale,
    title: `${messages.Auth.login.title} — ${messages.Common.appName}`,
    description: messages.Auth.login.subtitle,
    path: '/auth/login',
  });
}

export default function LoginPage() {
  return <LoginForm />;
}
