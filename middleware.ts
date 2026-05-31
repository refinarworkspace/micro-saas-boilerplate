import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing, locales, type Locale } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Routes (locale-stripped) that require an authenticated user.
const PROTECTED_PREFIXES = ['/dashboard', '/account', '/admin'];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const authConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('your-anon')
);

function localeFromPath(pathname: string): Locale {
  const seg = pathname.split('/')[1];
  return (locales as readonly string[]).includes(seg)
    ? (seg as Locale)
    : routing.defaultLocale;
}

function stripLocale(pathname: string): string {
  const parts = pathname.split('/');
  if ((locales as readonly string[]).includes(parts[1])) {
    return '/' + parts.slice(2).join('/');
  }
  return pathname;
}

function isProtected(pathname: string): boolean {
  const p = stripLocale(pathname);
  return PROTECTED_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(prefix + '/')
  );
}

export async function middleware(req: NextRequest) {
  // 1) Always run the i18n middleware first (locale detection + routing).
  const response = intlMiddleware(req);

  const { pathname } = req.nextUrl;

  // 2) Skip auth checks when the route is public or auth isn't configured
  //    (keeps the boilerplate fully explorable in demo mode).
  if (!isProtected(pathname) || !authConfigured) {
    return response;
  }

  // 3) Verify the session using a request-scoped Supabase client.
  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const locale = localeFromPath(pathname);
    const loginUrl = new URL(`/${locale}/auth/login`, req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Match everything except API routes, Next internals and static files.
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
