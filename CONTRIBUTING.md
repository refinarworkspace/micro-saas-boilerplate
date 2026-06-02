# Contributing to MicroSaaS Engine

Thanks for your interest in contributing to MicroSaaS Engine. This project is an open-source Next.js micro-SaaS starter kit for developers building production-ready small SaaS products and AI tool sites.

## Ways to contribute

- Report bugs or setup issues
- Improve documentation and examples
- Add or improve tests
- Improve Stripe, Supabase, auth, dashboard, admin, i18n, or static-template flows
- Add reusable toolkit components
- Review security-sensitive areas such as webhooks, protected routes, and environment-variable handling

## Development setup

```bash
git clone https://github.com/Rapen-Z/micro-saas-boilerplate.git
cd micro-saas-boilerplate
npm install
cp .env.local.example .env.local # optional; demo mode works without real keys
npm run dev
```

Open <http://localhost:3000>. The app redirects to a locale route such as `/en`.

## Useful commands

```bash
npm run lint
npm run type-check
npm test
npm run test:e2e
npm run build
```

For documentation-only changes, running the full test suite is optional. For code changes, please run the relevant checks before opening a pull request.

## Pull request guidelines

1. Keep PRs focused and small when possible.
2. Explain the motivation and user-facing impact.
3. Include screenshots for UI changes.
4. Add or update tests for behavior changes.
5. Update README or setup docs when configuration changes.
6. Do not commit real secrets, API keys, `.env.local`, Stripe keys, Supabase service-role keys, or webhook secrets.

## Code style

- Use TypeScript and keep types explicit for public helpers.
- Prefer small, reusable React components.
- Keep server-only logic and secrets out of client components.
- Follow the existing Tailwind/shadcn-style component conventions.
- Keep i18n strings in the message files when text is user-facing.

## Security-sensitive areas

Please be extra careful when changing:

- Stripe Checkout and webhook routes
- Supabase auth/session handling
- Admin authorization checks
- Middleware route protection
- RLS-related database schema
- Environment-variable loading
- File upload or user-generated content components

If you find a vulnerability, do **not** open a public issue. Follow the process in [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
