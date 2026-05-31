/**
 * @jest-environment node
 *
 * Middleware tests: locale-aware routing always runs, and protected routes
 * redirect unauthenticated users to the localized login page.
 */

const ORIGINAL_ENV = process.env;

describe('middleware', () => {
  beforeEach(() => {
    jest.resetModules();
    // Pretend Supabase is configured so the auth branch is exercised.
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-test-key',
    };

    // i18n middleware -> just continue.
    jest.doMock('next-intl/middleware', () => ({
      __esModule: true,
      default: () => () => {
        const { NextResponse } = require('next/server');
        return NextResponse.next();
      },
    }));
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('redirects unauthenticated users away from a protected route', async () => {
    jest.doMock('@supabase/ssr', () => ({
      createServerClient: () => ({
        auth: { getUser: async () => ({ data: { user: null } }) },
      }),
    }));

    const { middleware } = require('@/middleware');
    const { NextRequest } = require('next/server');

    const req = new NextRequest(new URL('http://localhost/en/dashboard'));
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/en/auth/login');
  });

  it('allows authenticated users through to a protected route', async () => {
    jest.doMock('@supabase/ssr', () => ({
      createServerClient: () => ({
        auth: {
          getUser: async () => ({ data: { user: { id: 'u1', email: 'a@b.c' } } }),
        },
      }),
    }));

    const { middleware } = require('@/middleware');
    const { NextRequest } = require('next/server');

    const req = new NextRequest(new URL('http://localhost/en/dashboard'));
    const res = await middleware(req);

    expect(res.status).not.toBe(307);
  });

  it('does not redirect public routes', async () => {
    const { middleware } = require('@/middleware');
    const { NextRequest } = require('next/server');

    const req = new NextRequest(new URL('http://localhost/en'));
    const res = await middleware(req);

    expect(res.status).not.toBe(307);
  });
});
