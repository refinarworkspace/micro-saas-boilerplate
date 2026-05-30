import type { Metadata } from 'next';
import { buildMetadata } from '@/components/SEOHead';
import type { Locale } from '@/i18n/routing';
import { SignupForm } from './SignupForm';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  return buildMetadata({
    locale,
    title: `${messages.Auth.signup.title} — ${messages.Common.appName}`,
    description: messages.Auth.signup.subtitle,
    path: '/auth/signup',
  });
}

export default function SignupPage() {
  return <SignupForm />;
}
