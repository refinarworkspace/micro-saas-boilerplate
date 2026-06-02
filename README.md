# MicroSaaS Engine

A production-ready **Next.js 14 (App Router)** micro-SaaS engine: Stripe billing,
Supabase auth, a protected user dashboard, an admin panel, a 20-component tool
UI library, an A/B testing framework, full i18n (en / zh / es), dark mode and a
complete test suite.

This repository also contains a second, framework-free **static template** under
[`static-boilerplate/`](./static-boilerplate) (open the HTML files directly, no
build step).

> **Demo mode:** every feature works without any API keys. Supabase, Stripe and
> the database layer fall back to safe simulated behaviour and representative
> demo data, so you can explore the dashboard, admin panel and checkout flow
> immediately. Add real keys to go live.

---

## Tech stack

| Concern | Choice |
| ------- | ------ |
| Framework | Next.js 14 (App Router, RSC) + TypeScript |
| Styling | Tailwind CSS + inlined shadcn-style UI |
| i18n | next-intl (English, Chinese, Spanish) |
| Theming | next-themes (light / dark / system) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Payments | Stripe Checkout + webhooks |
| Tests | Jest + Testing Library (unit), Playwright (e2e) |

---

## Quick start

```bash
git clone https://github.com/Rapen-Z/micro-saas-boilerplate.git
cd micro-saas-boilerplate
npm install
cp .env.local.example .env.local   # optional for demo mode
npm run dev
```

Open <http://localhost:3000> (you'll be redirected to your locale, e.g. `/en`).

---

## Environment variables

All are optional for local exploration (demo mode). See `.env.local.example`.

| Variable | Used by |
| -------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth + route protection |
| `SUPABASE_SERVICE_ROLE_KEY` | Server DB layer (`lib/db.ts`) — **server only** |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `NEXT_PUBLIC_STRIPE_PRICE_STARTER` / `_PRO` / `_BUSINESS` | Checkout price ids |
| `NEXT_PUBLIC_APP_URL` | Absolute URLs (checkout redirects, SEO) |

---

## Database

Run [`database-schema.sql`](./database-schema.sql) in the Supabase SQL editor.
It provisions:

- `subscriptions` — Stripe subscription state per user
- `user_roles` — optional DB-driven roles for the admin panel
- `tool_usage` — per-user usage events for dashboard stats
- `ab_events` — A/B testing exposures & conversions

RLS policies and an `updated_at` trigger are included.

---

## Modules

### 1. Stripe billing

- `app/api/stripe/create-checkout-session/route.ts` — creates a Checkout
  Session from a `priceId`; success → `/[locale]/account`, cancel → `/[locale]/pricing`.
- `app/api/stripe/webhook/route.ts` — verifies and handles
  `checkout.session.completed`, `customer.subscription.updated` and
  `customer.subscription.deleted`, syncing the `subscriptions` table.
- `lib/stripe.ts` — typed server client + `getOrCreateCustomer`, price↔plan helpers.
- `lib/db.ts` — Supabase **service-role** admin client + query helpers.
- The pricing page (`PricingSection` / `PricingCard`) calls the real API, shows a
  loading state, highlights the user's current plan and redirects to Checkout.

**Configure the webhook** in the Stripe dashboard pointing at
`https://your-domain.com/api/stripe/webhook`, then set `STRIPE_WEBHOOK_SECRET`.
Test locally with `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

### 2. User dashboard (protected)

- `app/[locale]/dashboard` — overview with stat cards, account info, recent tool
  usage and an API-keys placeholder.
- `app/[locale]/account` — billing/subscription page (also the Stripe success URL).
- `app/[locale]/dashboard/{api-keys,settings}` — additional sections.
- `components/DashboardLayout.tsx` — sidebar (Overview, Billing, API Keys, Settings).
- `components/UserStats.tsx` — presentational stat cards.
- Route protection lives in `middleware.ts` (redirects unauthenticated users to
  login for `/dashboard`, `/account`, `/admin`).

### 3. Admin panel

- `app/[locale]/admin` — overview (total users, active subscriptions, MRR, revenue).
- `app/[locale]/admin/users` — searchable, paginated users table with a details dialog.
- `app/[locale]/admin/subscriptions` — subscriptions table filterable by status.
- `app/[locale]/admin/experiments` — A/B test results.
- `app/api/admin/users` & `app/api/admin/stats` — admin-only JSON endpoints.
- `lib/admin.ts` — `isAdmin()` / `requireAdmin()` reading the role from Supabase
  user metadata (`app_metadata.role` / `user_metadata.role`).

**Grant admin** to a user (Supabase):

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
where email = 'you@example.com';
```

(or insert into `user_roles` and switch `lib/admin.ts` to query it.)

### 4. Toolkit component library

20 reusable, self-contained, dark-mode-ready client components under
`components/toolkit/`, exported from a barrel:

```tsx
import { QRCodeGenerator, ColorPicker, DiffViewer } from '@/components/toolkit';
```

`DragDropUpload`, `CompareSlider`, `CodeBlock`, `JsonTreeViewer`, `ColorPicker`,
`Base64Converter`, `QRCodeGenerator`, `PasswordStrengthMeter`, `DiffViewer`,
`LoremGenerator`, `UuidGenerator`, `UnitConverter`, `StopwatchTimer`,
`RegexTester`, `UrlParser`, `MetaTagPreview`, `SitemapGenerator`, `RobotsTester`,
`HttpStatusChecker`, `IpLookup`. Each file starts with a usage comment.

### 5. A/B testing

- `lib/ab-testing.ts` — `assignVariant`, `getAssignedVariant`, `trackEvent`,
  `trackConversion` (cookie-persisted assignment).
- `components/ABTest.tsx` — renders variant A or B and auto-tracks exposure.
- `app/api/ab-testing/track/route.ts` — records events to `ab_events`.
- `app/[locale]/admin/experiments` — results dashboard.

```tsx
import { ABTest } from '@/components/ABTest';
import { trackConversion } from '@/lib/ab-testing';

<ABTest experiment="homepage_hero" a={<HeroA />} b={<HeroB />} />;
// on conversion:
trackConversion('homepage_hero');
```

---

## Testing

Unit + integration tests (Jest + Testing Library) and end-to-end tests (Playwright).

```bash
npm test            # unit/integration tests
npm run test:watch  # watch mode
npm run test:coverage
npm run test:e2e    # Playwright (boots the dev server automatically)
```

- `jest.config.ts` / `jest.setup.ts` — jsdom env, jest-dom matchers, polyfills.
- `__tests__/` — homepage, color converter, image compressor, Stripe webhook,
  middleware (locale redirect + auth protection).
- `playwright.config.ts` + `e2e/homepage.spec.ts` — navigation and a live tool flow.

> First run for e2e: `npx playwright install` to download browsers.

---

## Project structure (key paths)

```
app/
  [locale]/            home, tools, auth, pricing, dashboard, account, admin
  api/
    stripe/            create-checkout-session, webhook
    admin/             users, stats
    ab-testing/track
    me/subscription
    auth/[...supabase]
components/
  toolkit/             20 reusable tool components (+ index.ts barrel)
  admin/               AdminUsersTable, StatusFilter
  ui/                  Button, Card, Input, Label, Switch, Dialog
  DashboardLayout, AdminLayout, PricingSection, PricingCard, UserStats, ABTest, …
lib/
  stripe.ts  db.ts  admin.ts  auth-server.ts  ab-testing.ts  utils.ts  supabaseClient.ts
i18n/                  routing, request, messages/{en,zh,es}.json
__tests__/  e2e/       test suites
database-schema.sql    Supabase schema
middleware.ts          locale detection + route protection
```

### Intentional choices

- **`middleware.ts` is at the repo root** (Next.js requirement) and combines the
  next-intl middleware with Supabase session-based protection.
- **API route handlers live under `app/api/`** (outside `[locale]`) so webhook and
  OAuth URLs are locale-independent; the middleware excludes `/api`.

---

## Deploy

Deploy to [Vercel](https://vercel.com): import the repo, add the environment
variables, run the SQL schema in Supabase, set the Stripe webhook endpoint, and
deploy. `npm run build` produces the production build.

## Contributing and security

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, development, and pull request guidelines.

If you discover a security issue, please do **not** open a public issue. Follow the private reporting process in [SECURITY.md](./SECURITY.md).

## License

MIT — build, rebrand and sell whatever you create with it. See [LICENSE](./LICENSE).
