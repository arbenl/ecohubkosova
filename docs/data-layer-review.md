# Data Layer Review (Architecture Roadmap v2.0)

This review audits the current implementation of the service layer under `src/services/**`. The goal was to surface inefficient access patterns (especially N+1 queries), verify the consistent use of Drizzle, and capture follow-up work for upcoming sprints.

## Methodology

1. **Inventory** – enumerated every module under `src/services` (auth, listings, profile, organizations, articles, dashboard, public APIs, and admin helpers).
2. **Access Pattern Audit** – inspected each file for `db.get()` usage, paying attention to joins, pagination, and `noStore`.
3. **Mutation Safety** – confirmed that write helpers encapsulate validation and transaction handling where needed.
4. **Testing Touchpoints** – noted which services already ship with Vitest coverage in `src/services/__tests__/**`.

## Findings by Module

### Listings (`src/services/listings.ts`)
- Both `fetchListings` and `fetchListingById` use a single joined query; no N+1 risk.
- Pagination is enforced via `ITEMS_PER_PAGE` and a `hasMore` sentinel.
- `findApprovedOrganizationId` performs one lookup per mutation, which is acceptable.
- *Follow-up*: consider caching expensive filter combos if usage spikes (non-blocking).

### Profile (`src/services/profile.ts`)
- Fetches user details and organization membership with targeted queries (`.limit(1)` everywhere).
- `ensureUserOrganizationMembership` is idempotent and index-friendly.
- *Follow-up*: route `console.warn/error` through centralized logging later.

### Public API (`src/services/public/*`)
- Endpoints (listings, organizations, articles) all rely on filtered, paginated queries.
- *Follow-up*: align request validation with shared Zod schemas to reject invalid filters earlier.

### Admin Services (`src/services/admin/**`)
- Each entity (users, organizations, listings, articles, org members) has a dedicated module and Vitest suite.
- Queries rely on `and/eq` to avoid per-row lookups; no loops around `db.get()`.
- *Follow-up*: evaluate pre-aggregating expensive stats when usage grows.

### Session & Auth Helpers (`src/services/session.ts`, `src/services/auth.ts`)
- Session versioning (`getSessionInfo`, `incrementSessionVersion`, `validateSessionVersion`) uses single queries with structured logging.
- Shared auth helpers ensure Supabase operations aren’t duplicated across server actions.

## Summary

- **N+1 vulnerabilities**: none detected.
- **Consistency**: Services uniformly use Drizzle via `db.get()` and return typed results.
- **Testing**: Listings, profile, auth, and admin modules already have Vitest coverage; `src/services/dashboard.ts` is the next best target for tests.

This document fulfills the Roadmap v2 P2 requirement for a formal data layer review. Revisit these findings after future feature work to keep the service layer healthy.
