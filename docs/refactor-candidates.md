# Refactor Candidates (Architecture Roadmap v2.0)

The registration-page refactor established a pattern of separating orchestration hooks, presentational components, and service calls. The following areas should adopt the same approach next.

## 1. Profile Management (`src/app/(private)/profile`)
- **Issue**: `profili-client-page.tsx` still owns tabs, validation, and Supabase calls in one file (>300 lines).
- **Plan**:
  - Extract hooks for user vs. organization mutations (mirroring `useRegistrationForm`).
  - Move tab panels into `src/components/profile/**` with shared form controls.
  - Route all data access through `src/services/profile.ts`.

## 2. Dashboard Overview (`src/app/(private)/dashboard`)
- **Issue**: The page mixes server data fetching with complex card/grid rendering.
- **Plan**:
  - Create a `useDashboardFilters` hook for client interactions.
  - Break cards/charts into dedicated components under `src/components/dashboard/**`.
  - Keep all server reads inside `src/services/dashboard.ts`.

## 3. Marketplace Client (`src/app/tregu/tregu-client-page.tsx`)
- **Issue**: Filter state, URL sync, and listing rendering live in a single component.
- **Plan**:
  - Introduce a `useMarketplaceFilters` hook that syncs search params.
  - Split filter widgets, result grid, and pagination into separate components for unit testing.

## 4. Admin CRUD Screens (`src/app/(private)/admin/**`)
- **Issue**: Each entity duplicates table scaffolding, modal logic, and toast handling.
- **Plan**:
  - Build a reusable `AdminDataTable` component that accepts columns/actions.
  - Share modal state via a `useAdminCrudDialog` hook to reduce boilerplate.

Address these after the critical roadmap items to maintain the same clarity achieved on the registration flow.
