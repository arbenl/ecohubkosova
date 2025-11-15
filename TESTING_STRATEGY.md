# EcoHub Kosova - Testing Strategy & Coverage Plan

**Branch:** `testing`  
**Last Updated:** November 15, 2025  
**Coverage Target:** 80%+ across all metrics

---

## 📊 Current Test Status

### Test Summary
- **Test Files:** 17 passing
- **Total Tests:** 68 passing
- **Status:** ✅ All tests passing
- **Framework:** Vitest + jsdom

### Test Coverage Configuration
```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "lcov", "html"],
  include: ["src/**/*.{ts,tsx}"],
  exclude: ["src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.test.tsx"],
  lines: 80,
  functions: 80,
  branches: 75,
  statements: 80,
}
```

---

## 🧪 Test Coverage by Module

### ✅ Well-Tested (High Coverage)
- **Authentication Services** (`src/lib/auth/`)
  - Sign-out handler (2 tests)
  - Profile service (3 tests)
  - Redirect behavior, session clearing, API calls

- **Admin Actions** (`src/app/(private)/admin/`)
  - Listings actions (5 tests)
  - Organizations actions (5 tests)
  - Articles actions (5 tests)
  - Organization members (5 tests)
  - Users actions (5 tests)

- **Data Services** (`src/services/`)
  - Admin listings, organizations, users, articles, members (20 tests)
  - Profile service (4 tests)
  - Listings service (3 tests)
  - Error handling and fallback paths

- **Profile Management** (`src/app/(private)/profile/`)
  - Update user profile (6 tests)
  - Update organization profile
  - Update user certifications
  - Redirect behavior for unauthorized access

- **UI Components** (`src/components/__tests__/`)
  - Button component (2 tests)

- **Utilities** (`src/lib/__tests__/`)
  - Utils helper functions (1 test)

### ⚠️ Partially Tested
- **Server Actions**: Basic paths tested, edge cases may be missing
- **API Routes**: Profile endpoint tested via integration
- **Public Pages**: No dedicated tests (home, explore, about, etc.)
- **Form Validation**: Basic validation tested, complex scenarios missing

### ❌ Not Tested (Coverage Gaps)
- **Public Page Routes** (`src/app/(public)/`)
  - Home page (`page.tsx`)
  - Explore page (`page.tsx`)
  - Marketplace page (`page.tsx`)
  - About page (`page.tsx`)
  - Partners page (`page.tsx`)

- **Utility Functions**
  - `src/lib/utils.ts` - Most utility functions
  - `src/lib/auth/roles.ts` - Role checking functions
  - `src/lib/supabase/` - Supabase client utilities

- **Hooks**
  - `src/hooks/use-mobile.tsx`
  - `src/hooks/use-toast.ts`

- **Middleware** - Not covered by unit tests

- **Database Operations** - Mocked in tests, real DB not tested

- **E2E Flows** - No end-to-end tests

---

## 🎯 Coverage Improvement Roadmap

### Phase 1: Critical Path Coverage (Target: 75%)
**Priority:** High  
**Effort:** Medium  
**Timeline:** 1-2 weeks

#### 1.1 Add Missing Service Tests
- [ ] Test all remaining functions in `src/services/` that aren't covered
- [ ] Add tests for error handling in database queries
- [ ] Test data transformation and mapping logic
- [ ] Verify null/undefined edge cases

```typescript
// Example: Test missing listings utility functions
describe("Listings Service Edge Cases", () => {
  it("handles empty results gracefully", () => {
    // Test implementation
  })
  
  it("validates listing data before processing", () => {
    // Test implementation
  })
})
```

#### 1.2 Add Validation Tests
- [ ] Test `src/validation/` schemas
- [ ] Add tests for auth validation
- [ ] Test profile validation
- [ ] Test listing validation

```typescript
// Example: Validation tests
describe("Auth Validation", () => {
  it("rejects invalid email", () => {
    // Test implementation
  })
  
  it("enforces password requirements", () => {
    // Test implementation
  })
})
```

#### 1.3 Add Utility Function Tests
- [ ] Expand `src/lib/utils.ts` tests
- [ ] Test all exported utility functions
- [ ] Add tests for string formatting, date handling, etc.

### Phase 2: Integration & API Testing (Target: 80%)
**Priority:** High  
**Effort:** Medium-High  
**Timeline:** 2-3 weeks

#### 2.1 Add API Endpoint Tests
- [ ] Test all `/api/auth/` endpoints
- [ ] Test `/api/listings/` endpoints
- [ ] Test error responses and status codes
- [ ] Test authentication headers

```typescript
// Example: API tests
describe("Auth API Endpoints", () => {
  it("returns user profile when authenticated", async () => {
    // Test implementation
  })
  
  it("returns 401 when unauthenticated", async () => {
    // Test implementation
  })
})
```

#### 2.2 Add Server Action Tests
- [ ] Complete coverage of all server actions
- [ ] Test data mutations
- [ ] Test error handling
- [ ] Test redirect behavior

#### 2.3 Add Hook Tests
- [ ] Test `use-mobile` hook responsive behavior
- [ ] Test `use-toast` hook notification lifecycle
- [ ] Test custom hook state management

### Phase 3: Page & Component Testing (Target: 85%)
**Priority:** Medium  
**Effort:** High  
**Timeline:** 3-4 weeks

#### 3.1 Add Public Page Tests
- [ ] Test home page rendering
- [ ] Test explore page with filters
- [ ] Test marketplace page listings
- [ ] Test about and partners pages

```typescript
// Example: Page component test
describe("Home Page", () => {
  it("renders featured listings", async () => {
    // Test implementation
  })
  
  it("has working navigation links", async () => {
    // Test implementation
  })
})
```

#### 3.2 Add Component Tests
- [ ] Test header component in different auth states
- [ ] Test footer component
- [ ] Test layout components
- [ ] Test form components

#### 3.3 Add Client Component Tests
- [ ] Test interactive components
- [ ] Test state management in components
- [ ] Test event handlers

### Phase 4: E2E & Edge Cases (Target: 90%+)
**Priority:** Medium-Low  
**Effort:** Very High  
**Timeline:** 4-6 weeks

#### 4.1 End-to-End Tests
- [ ] Complete user registration flow
- [ ] Complete login flow
- [ ] Complete marketplace listing creation
- [ ] Complete organization management flow

#### 4.2 Edge Case & Error Scenarios
- [ ] Network failure handling
- [ ] Timeout scenarios
- [ ] Concurrent operations
- [ ] Data validation edge cases
- [ ] Permission/authorization edge cases

#### 4.3 Performance Tests
- [ ] Query performance
- [ ] Component render performance
- [ ] Large data set handling

---

## 🛠️ Running Tests

### Run All Tests
```bash
pnpm test
```

### Run Tests with Coverage
```bash
pnpm test -- --coverage
```

### Run Specific Test File
```bash
pnpm test src/services/__tests__/listings.test.ts
```

### Watch Mode (Development)
```bash
pnpm test -- --watch
```

### Run Tests Matching Pattern
```bash
pnpm test -- --grep "auth"
```

### Generate HTML Coverage Report
```bash
pnpm test -- --coverage
# Open coverage/index.html in browser
```

---

## 📋 Test File Structure

### Naming Convention
- Test files: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- Test directories: `__tests__/` folder within each module
- Location: Colocated with source files

### Example Structure
```
src/
├── services/
│   ├── listings.ts
│   └── __tests__/
│       └── listings.test.ts
├── lib/
│   ├── auth/
│   │   ├── signout-handler.ts
│   │   └── __tests__/
│       └── signout-handler.test.ts
```

---

## ✨ Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` for setup
- Use `afterEach` for cleanup
- Clear mocks between tests

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  resetAuthState()
})
```

### 2. Mock External Dependencies
- Mock Supabase clients
- Mock fetch calls
- Mock Next.js routing
- Mock environment variables

```typescript
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signOut: vi.fn(),
  },
}
```

### 3. Test Behavior, Not Implementation
- Focus on inputs and outputs
- Test user-facing behavior
- Avoid testing internal state directly

```typescript
// Good: Test behavior
expect(onSignOut).toHaveBeenCalled()

// Avoid: Testing implementation
expect(ref.current).toBe(false)
```

### 4. Descriptive Test Names
- Use `it("should...")`  format
- Describe the expected behavior
- Include edge cases in name

```typescript
it("should redirect to login when user is not authenticated", () => {
  // Test implementation
})
```

### 5. Error Path Testing
- Test happy paths
- Test error scenarios
- Test edge cases
- Test validation failures

```typescript
describe("Error Handling", () => {
  it("handles network errors gracefully", () => {})
  it("shows validation error for invalid input", () => {})
  it("recovers from temporary failures", () => {})
})
```

---

## 🚀 CI/CD Integration

### Pre-commit Hooks
Recommended: Run tests before committing
```bash
# .husky/pre-commit
pnpm test -- --bail
```

### Pre-push Hooks
Recommended: Run full test suite and coverage before pushing
```bash
# .husky/pre-push
pnpm test -- --coverage
```

### CI Pipeline
Recommended checks:
1. Linting (`eslint`)
2. Type checking (`tsc`)
3. Test execution
4. Coverage reporting
5. Build verification

---

## 📈 Metrics & Goals

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| Line Coverage | TBD | 80% | High |
| Function Coverage | TBD | 80% | High |
| Branch Coverage | TBD | 75% | Medium |
| Statement Coverage | TBD | 80% | High |
| Test Count | 68 | 150+ | Medium |

---

## 🔍 Coverage Report

### Generating Reports
```bash
# Generate HTML report
pnpm test -- --coverage

# View in browser
open coverage/index.html
```

### Coverage Files
- `coverage/index.html` - HTML report
- `coverage/lcov.info` - LCOV format (for IDE integration)
- `coverage/coverage-final.json` - Machine-readable format

### Interpreting Coverage
- **Green (80-100%):** Good coverage
- **Yellow (60-80%):** Needs improvement
- **Red (<60%):** Critical gaps

---

## 🤝 Contributing Tests

### Adding a New Test
1. Create test file in `__tests__/` folder
2. Import testing utilities: `describe`, `it`, `expect`
3. Set up mocks in `beforeEach`
4. Write test cases
5. Clean up in `afterEach`
6. Run tests: `pnpm test`

### Example Template
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest"
import { myFunction } from "../my-module"

describe("MyModule", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should do something", () => {
    const result = myFunction()
    expect(result).toBe(expectedValue)
  })

  it("should handle errors", () => {
    expect(() => myFunction(invalidInput)).toThrow()
  })
})
```

---

## 🐛 Known Issues & Limitations

### Test Environment
- JSDOM doesn't support all browser APIs (navigation, etc.)
- Window.location navigation requires mocking
- Some React component lifecycle edge cases may not be testable

### Database Testing
- Tests use mocked Drizzle queries
- Real database integration not tested
- Migration testing would require separate setup

### E2E Testing
- Playwright E2E tests configured but not integrated with coverage
- Consider separate E2E test suite for critical flows

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Jest Matchers Reference](https://vitest.dev/guide/assertion.html)
- [Testing Best Practices](https://testingjavascript.com/)

---

## 🎓 Next Review Date

**Suggested Review:** December 15, 2025

- Assess coverage improvements
- Review test quality and effectiveness
- Plan next iteration
- Update coverage targets based on progress

---

**Branch Maintainer:** Testing Team  
**Last Updated By:** GitHub Copilot  
**Review Status:** ✅ Ready for Team Review
