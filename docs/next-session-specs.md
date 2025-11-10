# Next Session Specs

1. Replace client-side Supabase CRUD (admin dashboards, marketplace pages) with server actions/route handlers so auth and RLS run on the server; document the API surface.
2. Introduce a real automated test suite (Vitest/unit + Playwright smoke tests) and update `pnpm test` accordingly; wire it into CI.
3. Revisit `tsconfig.json`’s `skipLibCheck` by upgrading/patching upstream types (Redux Toolkit, cookie, lucide-react) so full type-checking can be re-enabled.
4. Add a GitHub Actions (or similar) workflow that runs `pnpm lint`, `pnpm test`, and `pnpm build` on PRs.
5. Plan the eventual React 19 / Next 15 upgrade once key dependencies announce support; track required version bumps in the roadmap.
6. Polish UX/error handling: centralize Supabase error toasts, add loading states for admin tables, and log failures (Sentry) for observability.
