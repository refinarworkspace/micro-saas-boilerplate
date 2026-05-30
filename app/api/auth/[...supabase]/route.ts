import { NextResponse, type NextRequest } from 'next/server';

// Catch-all auth handler (STUB for Supabase Auth).
//
// This mirrors the placeholder requested in the boilerplate spec. With Supabase
// you typically only need an OAuth *callback* handler that exchanges the `code`
// for a session cookie. This catch-all covers `/api/auth/callback` and any
// other `/api/auth/*` path you wire up later.

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // -----------------------------------------------------------------------
    // PRODUCTION: exchange the OAuth code for a session using a Supabase server
    // client and persist the session cookie. Example:
    //
    //   import { createServerClient } from '@supabase/ssr';
    //   const supabase = createServerClient(URL, ANON_KEY, { cookies: { ... } });
    //   await supabase.auth.exchangeCodeForSession(code);
    // -----------------------------------------------------------------------
    // eslint-disable-next-line no-console
    console.info('[auth] OAuth callback received (demo mode). Code present.');
  }

  // Redirect the user back into the app after the (placeholder) exchange.
  return NextResponse.redirect(`${origin}${next}`);
}

export async function POST(req: NextRequest) {
  // Placeholder for sign-out or other auth mutations.
  const { origin } = new URL(req.url);
  return NextResponse.json({ ok: true, origin });
}
