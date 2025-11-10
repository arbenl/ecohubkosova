# EcoHub Kosova Roadmap

## 1. Hardening & Tooling (Week 1-2)
- ✅ Stack locked to Next 14.2.13 / React 18.2 with exact dependency versions; lint/type checks now run as part of `pnpm build`.
- ✅ `react/no-unescaped-entities` handled via targeted overrides; `pnpm test` placeholder exists.
- Next steps: bring back full `skipLibCheck: false` once Redux Toolkit/Recharts/etc. release React 19-ready types, and add CI automation (lint/test/build) for every PR.

## 2. Data Layer & Security (Week 3-4)
- Move Supabase reads/writes for admin and marketplace flows into server actions/route handlers to hide anon keys and enforce auth.
- Fix pagination concurrency (functional state updates, request cancellation) and add shared error handling for data fetches.
- Surface user-facing notifications for Supabase errors instead of `alert`/`console`.

## 3. Feature Completion & UX Polish (Week 5-7)
- Replace raw `<img>` usage with `next/image`, audit media for optimization.
- Convert read-heavy sections to server components with caching/prefetching.
- Enhance auth flows (role-based dashboards, passwordless/OAuth) and guard routes server-side.

## 4. Testing & Observability (Week 8-9)
- Add unit/integration tests (Vitest/Playwright), seed scripts, and CI pipelines that run migrations + tests.
- Instrument logging/monitoring (Sentry, Vercel analytics) for key flows.

## 5. Operational Excellence (Week 10+)
- Automate deployments with preview environments, enable dependency bots, and document setup/release processes.
- Plan next features (notifications, messaging, analytics) once the core platform is stable.
