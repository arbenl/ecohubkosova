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

- ✅ Zod schemas exist for auth and listing creation (`src/validation/auth.ts`, `src/validation/listings.ts`), and server actions consume them.
- 🔜 Add schemas for profile edits, organization management, and admin actions; reuse them in both web and RN forms once ready.

## 4. Testing & CI

- ✅ `pnpm build` / `pnpm lint` run clean; Playwright specs were updated to match current copy (6 scenarios pass on an unrestricted machine).
- 🔜 Re-enable Playwright in an environment where Next.js can bind to a port; consider adding Vitest/unit coverage and wire everything into CI.

## 5. React Native Readiness

- ✅ Service/validation layers now offer framework-agnostic entry points.
- 🔜 Once the remaining flows are extracted, expose them via route handlers / shared SDKs that an RN client (or future API consumers) can call directly.

## Current Work Branch

- `feat/next-steps` — focus on migrating the remaining Supabase usage into `src/services` and expanding the Zod validator coverage.

## Next Priorities

1. Move profile/admin CRUD logic into dedicated service modules.
2. Add Zod schemas for those flows and hook them into server actions + UI.
3. Run Playwright (and later CI) in an environment that allows port binding; add unit tests where practical.
4. Start exposing the service layer via route handlers or edge functions that a React Native app can call without duplicating logic.
