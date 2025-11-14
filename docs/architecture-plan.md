# Architecture Plan (2025 React Native + Supabase Readiness)

This document tracks the restructuring blueprint we agreed to while preparing EcoHub Kosova for a shared web + React Native codebase.

## 1. Security & Auth Hardening

- ✅ Centralized admin checks (`lib/auth/roles.ts`) ensure every privileged server action verifies the canonical `users` record rather than trusting JWT metadata.
- ✅ Updated `scripts/02-setup-rls.sql` introduces `public.is_admin()` and rewritten policies so Postgres enforces the same constraints.
- ✅ Auth flows (login/registration) now use shared validators (`src/validation/auth.ts`).
- 🔜 Apply the new SQL to Supabase (if not already done) and expand the helper pattern to other flows (profile/admin dashboards).

## 2. Server‑Driven Data Layers

- ✅ Drejtoria, Qendra e Dijes, Tregu, and dashboard stats now fetch strictly on the server via `src/services/*`.
- ✅ Client shells (e.g., `app/drejtoria/drejtoria-client-page.tsx`) only handle filters/pagination and mutate URL state.
- 🔜 Extract remaining inline Supabase logic (profile forms, admin CRUD, auth provider) into those same service modules so React Native can import them.

## 3. Shared Validation

- ✅ Zod schemas now back all auth, listing creation, and profile/organization updates (`src/validation/auth.ts`, `src/validation/listings.ts`, `src/validation/profile.ts`), and the corresponding server actions consume the sanitized payloads.
- 🔜 Extend the pattern to the remaining admin CRUD flows and their UI so every mutation shares the same schema across web and RN.

## 4. Testing & CI

- ✅ `pnpm build` / `pnpm lint` run clean; Playwright specs were updated to match current copy (6 scenarios pass on an unrestricted machine).
- 🔜 Re-enable Playwright in an environment where Next.js can bind to a port; add Vitest + React Testing Library for unit/component coverage and wire everything into CI.

## 5. React Native Readiness

- ✅ Service/validation layers now offer framework-agnostic entry points.
- 🔜 Once the remaining flows are extracted, expose them via route handlers / shared SDKs that an RN client (or future API consumers) can call directly.

## 6. Tooling & Code Organization

- 🟡 Database migrations currently live as hand-authored SQL in `/scripts`. Adopt a versioned migration tool (Supabase CLI, Drizzle Kit, etc.) so schema changes can be diffed, reverted, and applied consistently across environments.
- ✅ All application code now lives under `src/**` (`src/app`, `src/components`, `src/hooks`, `src/lib`, `src/services`, `src/validation`), giving RN and future SDKs a single import root.

## Current Work Branch

- `feat/next-steps` — focus on migrating the remaining Supabase usage into `src/services` and expanding the Zod validator coverage.

## Next Priorities

1. Finish extracting profile/admin CRUD logic into service modules and expose them through server actions only.
2. Extend the new Zod schema coverage to the remaining admin operations and plug them into both server actions and client forms.
3. Adopt a proper migration tool (e.g., Supabase CLI/Drizzle) to replace the manual SQL scripts and keep schema history reviewable.
4. Document and enforce the new `src/**`-only layout across generators (shadcn config, new modules, docs) so future code never drifts back to the root.
5. Re-enable Playwright and introduce Vitest + React Testing Library so unit/component suites run locally and in CI.
6. Publish the service layer via typed route handlers / SDK endpoints for React Native and other consumers once the above refactors land.
