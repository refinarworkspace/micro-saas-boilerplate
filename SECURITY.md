# Security Policy

MicroSaaS Engine is a starter kit that includes authentication, billing, admin routes, database access, webhooks, and reusable UI/tool components. Security reports are taken seriously.

## Supported versions

The `main` branch is the actively maintained version. Security fixes are applied to `main` first.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.

Instead, report the issue privately by emailing:

- `support@toolpile.dev`

Include as much detail as possible:

- Affected files, routes, or components
- Steps to reproduce
- Expected impact
- Any proof of concept, if safe to share
- Suggested fix, if available

We will try to acknowledge valid reports within 7 days and provide a fix or mitigation plan as soon as practical.

## Security scope

Areas especially relevant to this repository:

- Supabase authentication and session handling
- Supabase service-role usage and server-only helpers
- Stripe Checkout and webhook signature verification
- Admin route authorization
- Middleware route protection
- Database schema, RLS policies, and role handling
- Environment variable handling
- User-generated content and file/tool components
- Dependency vulnerabilities affecting the starter template

## Out of scope

The following are generally out of scope unless they demonstrate a concrete exploit in this repository:

- Vulnerabilities in third-party services themselves, such as Stripe or Supabase
- Issues caused by deploying with intentionally insecure environment variables
- Social engineering or phishing
- Denial-of-service reports without a practical mitigation path
- Automated scanner output without reproduction details

## Handling secrets

Never commit real secrets to this repository. Use `.env.local` for local development and platform-specific secret managers for production deployments. The `.env.local.example` file contains placeholders only.

If a real secret is accidentally committed, rotate it immediately in the upstream provider dashboard, remove it from the repository history when appropriate, and open a private security report.

## Disclosure

Please allow reasonable time for a fix before public disclosure. We appreciate coordinated disclosure and responsible reporting.
