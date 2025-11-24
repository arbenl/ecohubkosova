# Project Health Check & Roadmap

## Health Summary (Nov 2025)

### 1. i18n Structure

- **Status**: Functional but monolithic.
- **Issue**: `messages/en.json` and `sq.json` are large (~500+ lines). This will cause merge conflicts and maintenance pain.
- **Good News**: Type-safety is already configured in `src/types/global.d.ts`.

### 2. Testing

- **Unit**: Good coverage for dashboard components.
- **E2E**: Comprehensive suite in `e2e/`, but some tests were flaky due to strict selector matching (fixed `home-i18n.spec.ts`).
- **Coverage**: Core flows (auth, home) are covered.

### 3. Sentry & Error Handling

- **Status**: Excellent.
- **Config**: Fully configured for Client, Server, and Edge.
- **Smoke Tests**: Verified working.

### 4. Tech Debt / TODOs

- **Hardcoded Styles**: `header-client.tsx` has some complex inline logic.
- **Middleware**: `PROTECTED_ROUTES` list is manual; consider moving to a centralized config.
- **Translation Files**: Need splitting.

---

## Roadmap (Next 2 Weeks)

### Priority 1: Stability & Quality (This Week)

- [x] **Fix Flaky E2E Tests**: Stabilize `home-i18n.spec.ts` (Done).
- [x] **Stabilize Auth E2E**: Check `auth-flow.e2e.spec.ts` for similar strict mode issues (Done).
- [ ] **Content Audit**: Scan for hardcoded Albanian strings in TSX files.

### Priority 2: Developer Experience (Next Week)

- [ ] **Split Translation Files**: Refactor `messages/*.json` into feature files (e.g., `auth.json`, `home.json`).
- [ ] **Strict Type Checks**: Enable stricter TS checks for `next-intl` usage.

### Priority 3: UX Polish

- [ ] **Loading States**: Add skeleton loaders for the Marketplace page.
- [ ] **404 Page**: Custom design for 404 page (currently default).

---

## Implemented Task: Stabilize Home I18n Tests

**Changes:**

- Updated `e2e/home/home-i18n.spec.ts` to use robust `getByRole` selectors.
- Fixed "Strict mode violation" errors where `getByText` matched multiple elements.
- Ensured viewport consistency for responsive elements (Language Switcher).

**Verification:**

```bash
pnpm playwright test e2e/home/home-i18n.spec.ts
```
