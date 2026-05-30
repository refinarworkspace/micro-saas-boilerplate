'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleIcon } from '@/components/GoogleIcon';
import { signInWithEmail, signInWithGoogle } from '@/lib/supabaseClient';

type Status =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'google' }
  | { type: 'error'; message: string }
  | { type: 'success' };

export function LoginForm() {
  const t = useTranslations('Auth');
  const tl = useTranslations('Auth.login');
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [status, setStatus] = React.useState<Status>({ type: 'idle' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ type: 'loading' });
    const res = await signInWithEmail(email, password);
    if (res.success) {
      setStatus({ type: 'success' });
      setTimeout(() => router.push('/'), 900);
    } else {
      setStatus({ type: 'error', message: res.message ?? tl('error') });
    }
  }

  async function handleGoogle() {
    setStatus({ type: 'google' });
    const res = await signInWithGoogle();
    if (!res.success) {
      setStatus({ type: 'error', message: res.message ?? tl('error') });
    } else if (res.message === 'demo') {
      setStatus({ type: 'success' });
      setTimeout(() => router.push('/'), 900);
    }
  }

  const isBusy = status.type === 'loading' || status.type === 'google';

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{tl('title')}</CardTitle>
          <CardDescription>{tl('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isBusy}
            onClick={handleGoogle}
          >
            {status.type === 'google' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            {t('google')}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Link
                  href="/auth/login"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {tl('forgotPassword')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {status.type === 'error' && (
              <p className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {status.message}
              </p>
            )}
            {status.type === 'success' && (
              <p className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {tl('success')}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isBusy}>
              {status.type === 'loading' && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {tl('submit')}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {tl('noAccount')}{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:underline"
            >
              {tl('signupLink')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
