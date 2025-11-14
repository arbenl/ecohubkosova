# Architecture Plan (2025 React Native + Supabase Readiness)

This document tracks the restructuring blueprint we agreed to while preparing EcoHub Kosova for a shared web + React Native codebase.

## Status Snapshot

| Pillar | Status | Notes |
| --- | --- | --- |
| Security & Auth | ✅ Core helpers + SQL policies landed; AuthProvider/profile API reviewed and documented below. |
| Server Data Layer | ✅ All dashboard/marketplace/admin flows pull data from `src/services/**`; Supabase usage centralized. |
| Validation | ✅ Auth, listings, profile, and admin CRUD reuse shared Zod schemas. |
| Testing & CI | ✅ Vitest suite covers profile/auth/admin/listings services + actions. Playwright next to be re-enabled in CI. |
| Tooling | ✅ Supabase migrations, Drizzle, formatter, and local type shims keep builds/tests reproducible. |


## 1. Security & Auth Hardening

- ✅ Centralized admin checks (`lib/auth/roles.ts`) ensure every privileged server action verifies the canonical `users` record rather than trusting JWT metadata.
- ✅ Updated `scripts/02-setup-rls.sql` introduces `public.is_admin()` and rewritten policies so Postgres enforces the same constraints.
- ✅ Auth flows (login/registration) now use shared validators (`src/validation/auth.ts`).
- ✅ Completed a focused review of `AuthProvider` + `/api/auth/profile` + `profile-service.ts`: the provider now only hydrates profile/state via the server route, reuses the shared Supabase client + sign-out handler, and resets state deterministically so the refactor’s architectural impact is fully documented.
- 🔜 Apply the new SQL to Supabase (if not already done) and expand the helper pattern to other flows (profile/admin dashboards).

## 2. Server‑Driven Data Layers

- ✅ Drejtoria, Qendra e Dijes, Tregu, and dashboard stats now fetch strictly on the server via `src/services/*`.
- ✅ Client shells (e.g., `app/drejtoria/drejtoria-client-page.tsx`) only handle filters/pagination and mutate URL state.
- ✅ Profile + admin CRUD flows now route through `src/services` (including the new `src/services/admin/*` helpers), so server actions stay thin and React Native can reuse the same logic.
- ✅ Users, listings, organizations, organization members, and articles server actions no longer instantiate Supabase clients directly; each action now calls its Drizzle-backed service so there is a single data-entry point for admins.
- ✅ Admin overview stats now live in `src/services/admin/stats.ts`, and `app/admin/actions.ts` simply reuses that helper so web + future RN clients share the same data contract.
- ✅ All admin server actions now rely on the shared `requireAdminRole()` helper (backed by `getServerUser` + Drizzle) rather than instantiating Supabase clients per action, which keeps Supabase usage centralized under `src/lib/supabase-server.ts`.
- ✅ `/tregu` filtering + sorting is now fully server-driven: the client pushes condition/location/sort inputs into the URL, `getListingsData` forwards them to `src/services/listings`, and the server response is the single source of truth for pagination + filters.
- ✅ The profile page no longer relies on a single 300-line “god component”; user and organization forms now live in dedicated components (`UserProfileForm`, `OrganizationProfileForm`) that encapsulate their own validation + submission state, making the tabs easier to reason about.
- ✅ Added Vitest coverage for `src/app/profili/actions.ts`, exercising profile update/server-action logic so regressions in user + organization flows get caught locally and in CI.
- ✅ Extended Vitest coverage to the admin/marketplace layer: server actions + services for users, listings, organizations, organization members, and articles now include regression tests (role gating, validation, Drizzle mutations), alongside the `/tregu` service filters.
- ✅ AuthProvider no longer creates DB records on the client: `/api/auth/profile` + `ensureUserProfileExists` handle profile creation server-side, a new sign-out helper encapsulates the sensitive logout flow, and the entire path is now unit-tested.
- ✅ Dashboard + Tregu + Drejtoria server components now call `getServerUser()` instead of instantiating raw Supabase clients, and they load profile data exclusively through `src/services/profile` to keep all DB access inside the service layer.

## 3. Shared Validation

- ✅ Zod schemas now back all auth, listing creation, profile/organization updates, and every admin CRUD screen (`src/validation/{auth,listings,profile,admin}.ts`); server actions and client forms both reuse the sanitized payloads.

## 4. Testing & CI

- ✅ `pnpm build` / `pnpm lint` run clean; Playwright specs were updated to match current copy (6 scenarios pass on an unrestricted machine).
- ✅ Vitest now covers profile actions, auth helpers (`profile-service`, `signout-handler`), public marketplace services (`fetchListings`, `fetchListingById` edge cases, etc.), profile services, and every admin action/service pair (users, listings, organizations, org members, articles) with mocked Drizzle + role-gating assertions.
- 🔜 Re-enable Playwright in an environment where Next.js can bind to a port; add Vitest + React Testing Library for unit/component coverage and wire everything into CI.

## 5. React Native Readiness

- ✅ Service/validation layers now offer framework-agnostic entry points.
- 🔜 Once the remaining flows are extracted, expose them via route handlers / shared SDKs that an RN client (or future API consumers) can call directly.

## 6. Tooling & Code Organization

- ✅ Database migrations now live under `supabase/migrations/**` (managed with the Supabase CLI) and seeds in `supabase/seed.sql`, replacing the legacy `/scripts` SQL.
- ✅ Drizzle ORM powers the admin service layer via the Supabase Postgres connection string, giving us typed queries without sacrificing the Supabase auth checks executed in server actions.
- ✅ All application code now lives under `src/**` (`src/app`, `src/components`, `src/hooks`, `src/lib`, `src/services`, `src/validation`), giving RN and future SDKs a single import root.
- ✅ Added a local `types/testing-library__jest-dom` shim and wired it through `tsconfig.json`’s `typeRoots` to keep `pnpm build`/`tsc` green while Vitest uses the modern RTL APIs.

## Current Work Branch

- `feat/architecture-next` — focus on migrating the remaining Supabase usage into `src/services` and expanding the Zod validator coverage.

## Next Priorities

1. ✅ Document and enforce the new `src/**`-only layout across generators (shadcn config, new modules, docs) so future code never drifts back to the root.
2. Re-enable Playwright and introduce Vitest + React Testing Library so unit/component suites run locally and in CI (`pnpm test`, `pnpm test:e2e`).
3. ✅ Publish the service layer via typed route handlers / SDK endpoints for React Native and other consumers once the above refactors land (see `/api/v1/*`).
4. Investigate and harden the lingering cross-session sign-out issue once the above foundational work is complete.
5. Wire Supabase migrations into CI (db reset/lint) so schema drift is caught automatically.

## Upcoming Enhancements (from latest architecture audit)

1. Add a `pnpm db:sync` script that chains `supabase db diff/push` with `pnpm drizzle:generate` so schema changes always refresh Drizzle types, and integrate it into CI.
2. ✅ Introduce Prettier (script + optional pre-commit hook) to keep formatting consistent across contributors (`pnpm format`, `pnpm format:check`).
3. Expand Vitest coverage (ListingCard, tregu client flows, server actions) and keep Playwright scenarios up to date.
4. Evaluate TanStack Query + Zustand for complex client/server state on pages like `tregu-client`, reducing ad-hoc state wiring.
5. Add monitoring/observability (e.g., Sentry) before production launch.
