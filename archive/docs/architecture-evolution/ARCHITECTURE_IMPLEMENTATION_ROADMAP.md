# Architecture Implementation Roadmap

**Status:** Active Development  
**Last Updated:** November 16, 2025  
**Foundation:** ARCHITECTURE_VISION_V6.md + Testing Strategy Implementation

---

## Executive Summary

The project now has **116 passing unit tests**, a solid foundation, and a clear 4-pillar vision for scaling. This document translates that vision into concrete, sequenced implementation steps.

---

## Implementation Phases

### Phase 1: Comprehensive Testing Confidence (Current - Next 2 weeks)

**Status:** E2E Testing Foundation Ready ✅

**Already Done:**

- Unit test suite established (116 tests, ~1 second)
- Playwright configured with `playwright.config.ts`
- `e2e/example.spec.ts` template available

**Next Steps:**

1. **Build Priority 0 E2E Tests** (Critical Path)

   ```bash
   pnpm test:e2e
   ```

   Create test files in `e2e/`:
   - `auth/registration.spec.ts` - User signup flow
   - `auth/login.spec.ts` - Login and logout
   - `marketplace/create-listing.spec.ts` - Create marketplace item
   - `marketplace/view-details.spec.ts` - View listing details

   **Reference:** `E2E_TESTING_STRATEGY.md` section 5 (Page Object Model pattern)

2. **Add Test Data Helpers** (`e2e/helpers/`)
   - `auth.ts` - Login/signup utilities
   - `db.ts` - Setup/teardown test users and listings
   - `navigation.ts` - Common page navigation

3. **Implement Page Objects** (`e2e/pages/`)
   - `LoginPage` - Login form selectors and actions
   - `RegisterPage` - Registration form
   - `MarketplacePage` - Listing filters and search
   - `ListingDetailPage` - Single listing view

**Success Criteria:**

- 10+ E2E tests passing
- Tests run in CI/CD pipeline
- Critical user flows covered

---

### Phase 2: Component-Driven Development (Weeks 3-4)

**Goal:** Enable faster, more consistent UI development

**Step 1: Integrate Storybook**

```bash
# Add Storybook to the project
npx storybook@latest init

# Start Storybook
pnpm storybook
```

**Step 2: Create Core Component Stories** (`src/components/**/*.stories.ts`)

Priority components:

- `Button.stories.ts` - All button variants (primary, secondary, disabled, loading)
- `Input.stories.ts` - Text, email, password, textarea inputs
- `Card.stories.ts` - Card container and variants
- `ProfileRetryUI.stories.ts` - Error and DB unavailable states
- `ListingCard.stories.ts` - Listing preview cards
- Form components - Any custom form controls

**Benefits:**

- Visual documentation of design system
- Isolated component testing
- Faster development and debugging
- Better handoff to designers/stakeholders

**Configuration:**

- Add `.storybook/main.ts` for Next.js integration
- Use `@storybook/addon-a11y` for accessibility testing
- Document variants and use cases

---

### Phase 3: Performance & Monitoring (Weeks 5-6)

**Goal:** Proactive visibility into application health

**Step 1: Bundle Analysis**

```bash
npm install --save-dev @next/bundle-analyzer
```

Update `next.config.mjs`:

```javascript
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})
export default withBundleAnalyzer(nextConfig)
```

Run analysis:

```bash
ANALYZE=true pnpm build
```

**Step 2: Error Tracking (Sentry)**

```bash
pnpm add @sentry/nextjs
```

Initialize in `src/app/layout.tsx` and API routes.

**Step 3: Performance Monitoring**

- Monitor Core Web Vitals with `web-vitals` package
- Set up alerts for bundle size increases
- Track database health via `/api/health/db` endpoint

---

### Phase 4: Future-Proofing & Scalability (Weeks 7-8)

**Goal:** Prepare for growth and internationalization

**Step 1: Internationalization (i18n)**

```bash
pnpm add next-intl
```

**Action Plan:**

1. Create `messages/` folder for translations (sq.json, en.json)
2. Extract user-facing strings (forms, buttons, labels)
3. Wrap application with i18n provider
4. Test with multiple languages

**Step 2: API Formalization**

```bash
pnpm add -D swagger-ui-react swagger-jsdoc
```

- Create OpenAPI specification for `/api/v1/*` endpoints
- Document request/response schemas
- Generate interactive API documentation

---

## Current Test Metrics

| Metric             | Value      | Target  |
| ------------------ | ---------- | ------- |
| Unit Tests Passing | 116        | ✅ 100% |
| Test Duration      | ~1s        | < 2s    |
| Coverage (Lines)   | To measure | 50%+    |
| E2E Tests          | 0          | 15+     |
| Bundle Size        | TBD        | < 500KB |

---

## Technology Stack Summary

| Layer                    | Technology          | Status     |
| ------------------------ | ------------------- | ---------- |
| **Testing**              | Vitest + Playwright | ✅ Ready   |
| **UI Development**       | Storybook           | 📋 Planned |
| **Performance**          | Bundle Analyzer     | 📋 Planned |
| **Monitoring**           | Sentry              | 📋 Planned |
| **Internationalization** | next-intl           | 📋 Planned |
| **API Documentation**    | OpenAPI/Swagger     | 📋 Planned |

---

## Quality Gates

Each phase should achieve:

1. **Phase 1 (E2E):** No critical user journeys untested
2. **Phase 2 (Storybook):** All UI components have stories with variants
3. **Phase 3 (Monitoring):** Error tracking + performance metrics active
4. **Phase 4 (i18n):** Support for Albanian + English (placeholder)

---

## Command Reference

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm start                  # Start production server

# Testing
pnpm test                   # Run unit tests
pnpm test:watch             # Watch mode
pnpm test -- --coverage     # Coverage report
pnpm test:e2e               # Run E2E tests (Playwright)

# Quality
pnpm lint                   # ESLint
pnpm format                 # Prettier

# Documentation
pnpm storybook              # Start Storybook dev server
ANALYZE=true pnpm build     # Analyze bundle
```

---

## Success Criteria - Overall

✅ **Done:**

- Unit testing foundation (116 tests)
- Build verification
- TypeScript strict mode
- Authentication patterns
- Database schema with Drizzle

📋 **In Progress:**

- E2E test suite (Priority 0)

📋 **Next:**

- Component documentation (Storybook)
- Performance optimization
- Production monitoring
- i18n support

🎯 **Final Goal:**

- 50%+ code coverage across all layers
- E2E tests for all critical paths
- Full component documentation
- Production monitoring and alerting
- Multi-language support ready
