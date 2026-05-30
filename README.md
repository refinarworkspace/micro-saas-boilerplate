# MicroSaaS Boilerplate

A production-ready **Next.js 14 (App Router)** boilerplate for shipping micro
SaaS tools fast — with internationalization, dark mode, authentication and
payments wired up out of the box.

This repository contains **two independent boilerplates**:

1. **Next.js 14 micro-SaaS boilerplate** — the project at the repo root (this README).
2. **Pure static HTML/CSS/JS template** — under [`static-boilerplate/`](./static-boilerplate) (no build step, just open the files).

---

## Tech stack

| Concern | Choice |
| ------- | ------ |
| Framework | Next.js 14 (App Router, RSC) |
| Language | TypeScript |
| Styling | Tailwind CSS + inlined shadcn-style UI components |
| i18n | [next-intl](https://next-intl-docs.vercel.app/) — English, Chinese, Spanish |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) — light / dark / system |
| Auth | Supabase Auth (placeholder, demo-mode safe) |
| Payments | Stripe Checkout + webhook (placeholder, demo-mode safe) |
| Icons | lucide-react |

> **Demo mode:** the app runs perfectly without any API keys. The Supabase and
> Stripe integrations fall back to safe simulated behaviour until you add real
> credentials, so you can explore every page immediately.

---

## Features

- ⚡ **Conversion-optimized landing page** — hero, features, tools, pricing, FAQ accordion and CTA banner.
- 🌍 **Full i18n** — every UI string is translated (`en`, `zh`, `es`) with automatic locale detection via middleware.
- 🌗 **Dark mode** — class strategy with a light/dark/system toggle.
- 🔐 **Auth pages** — email/password + Google OAuth, with error & success states.
- 💳 **Pricing & checkout** — 3 tiers, placeholder Stripe checkout, webhook stub.
- 🧰 **Client-side tools** — all run 100% in the browser:
  - **Image Compressor** — Canvas-based JPG/PNG compression with a quality slider and size comparison.
  - **Markdown Preview** — live `react-markdown` rendering with one-click "Copy HTML".
  - **Color Converter** — real-time HEX ⇆ RGB ⇆ HSL with a live swatch and copy buttons.
- 🔎 **SEO** — reusable `buildMetadata` helper with Open Graph + Twitter tags and locale alternates.

---

## Getting started

### Prerequisites

- Node.js **18.17+**
- npm, pnpm or yarn

### 1. Clone

```bash
git clone https://github.com/Rapen-Z/micro-saas-boilerplate.git
cd micro-saas-boilerplate
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the values you have. **All of them are optional for local exploration** —
without them the app runs in demo mode.

| Variable | Required for | Where to get it |
| -------- | ------------ | --------------- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Real auth | [Supabase → Project Settings → API](https://app.supabase.com) |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Real payments | [Stripe → Developers → API keys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification | `stripe listen` or the dashboard |
| `NEXT_PUBLIC_STRIPE_PRICE_*` | Checkout | Stripe → Products |

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to
your detected locale (e.g. `/en`).

---

## Available scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |
| `npm run type-check` | Type-check without emitting |

---

## Project structure

```
micro-saas-boilerplate/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx            # Root layout: providers, Header, Footer
│   │   ├── page.tsx              # Homepage
│   │   ├── not-found.tsx         # Localized 404
│   │   ├── tools/
│   │   │   ├── page.tsx          # Tools index
│   │   │   ├── image-compressor/
│   │   │   ├── markdown-preview/
│   │   │   └── color-converter/
│   │   ├── auth/{login,signup}/
│   │   └── pricing/
│   ├── api/                      # Route handlers (locale-independent)
│   │   ├── stripe-webhook/route.ts
│   │   └── auth/[...supabase]/route.ts
│   ├── globals.css
│   ├── icon.svg                  # Favicon (App Router convention)
│   └── not-found.tsx             # Root 404
├── components/                   # Header, Footer, ThemeToggle, tools UI, ui/*
├── hooks/                        # useDebounce, useLocalStorage
├── i18n/                         # routing, request config, messages/{en,zh,es}.json
├── lib/                          # utils, supabaseClient, stripe, checkout
├── public/                       # static assets (og-image, …)
├── middleware.ts                 # Locale detection & routing
└── tailwind.config.ts
```

### Notes on a few intentional choices

- **`middleware.ts` lives at the repo root**, not under `app/`. Next.js only
  recognizes middleware at the project root (or `src/`), so this is required for
  locale detection to work.
- **API route handlers live under `app/api/`**, outside the `[locale]` segment.
  Webhooks and OAuth callbacks use fixed, locale-independent URLs (e.g. Stripe
  calls `/api/stripe-webhook`), and the middleware excludes `/api`.

---

## Internationalization

- Locales are defined in [`i18n/routing.ts`](./i18n/routing.ts) (`en`, `zh`, `es`).
- All strings live in [`i18n/messages/`](./i18n/messages). Add a new language by
  creating `xx.json` and appending the locale to `routing.ts`.
- The `LanguageSwitcher` preserves the current page when switching languages.

## Theming

`next-themes` is configured with the class strategy in the root layout. The
`ThemeToggle` lets users pick light, dark or system.

## Authentication (Supabase)

`lib/supabaseClient.ts` exposes `signInWithEmail`, `signUpWithEmail` and
`signInWithGoogle`. When Supabase env vars are missing they simulate success so
the UI is fully explorable. The OAuth callback stub lives at
`app/api/auth/[...supabase]/route.ts`.

## Payments (Stripe)

The pricing page triggers `lib/checkout.ts → startCheckout()`. In production,
point it at a route handler that creates a Stripe Checkout Session and redirect
to the returned URL. The webhook handler stub is at
`app/api/stripe-webhook/route.ts`.

## SEO

Use `buildMetadata` from `components/SEOHead.tsx` inside any page's
`generateMetadata` export for consistent titles, descriptions, canonical URLs,
locale alternates and Open Graph / Twitter tags.

---

## Deploy

Deploy to [Vercel](https://vercel.com) (recommended) or any Node host:

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add the environment variables from `.env.local`.
4. Deploy.

---

## License

MIT — build, rebrand and sell whatever you create with it.
