# Next Session Specs

## Working Agreement for Codex Sessions

- Before coding, skim `README.md`, this file, and `docs/roadmap.md` to confirm priorities and current stack.
- Use PNPM for all commands (`pnpm install`, `pnpm lint`, `pnpm test`, `pnpm build`, etc.).
- Stay on the pinned Next 14.2.13 / React 18.2 toolchain unless the roadmap explicitly says to upgrade.
- Leave short notes in this file if you change scope or discover blockers so the next session has context.

1. Replace client-side Supabase CRUD (admin dashboards, marketplace pages) with server actions/route handlers so auth and RLS run on the server; document the API surface.
2. Introduce a real automated test suite (Vitest/unit + Playwright smoke tests) and update `pnpm test` accordingly; wire it into CI.
3. Revisit `tsconfig.json`’s `skipLibCheck` by upgrading/patching upstream types (Redux Toolkit, cookie, lucide-react) so full type-checking can be re-enabled.
4. Add a GitHub Actions (or similar) workflow that runs `pnpm lint`, `pnpm test`, and `pnpm build` on PRs.
5. Plan the eventual React 19 / Next 15 upgrade once key dependencies announce support; track required version bumps in the roadmap.
6. Polish UX/error handling: centralize Supabase error toasts, add loading states for admin tables, and log failures (Sentry) for observability.
