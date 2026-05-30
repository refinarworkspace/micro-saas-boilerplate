import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Locale detection + routing middleware.
// It reads the `Accept-Language` header and the existing cookie to redirect
// users to their preferred locale (e.g. `/` -> `/en`).
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for:
  // - API routes (/api, /trpc)
  // - Next.js internals (/_next, /_vercel)
  // - static files (anything containing a dot, e.g. favicon.ico)
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
