# Testing Quick Start Guide

## Run Tests

```bash
# Run all unit tests (116 tests, ~1 second)
pnpm test

# Run with coverage report
pnpm test -- --coverage

# Watch mode for development
pnpm test:watch

# Run E2E tests (when implemented)
pnpm test:e2e
```

## Current Test Coverage

### ✅ Active Unit Tests (116)
| Category | Count | Examples |
|----------|-------|----------|
| **Validation** | 89 | Auth, Listings, Profile, Admin schemas |
| **Hooks** | 17 | use-auth-form, use-mobile |
| **Components** | 2 | Button |
| **Utilities** | 8 | Schema, Utils, Types |
| **Auth** | 2 | Signout handler |
| **TOTAL** | **116** | ✅ All passing in <1s |

### ⏸️ Tests to E2E (Skipped)
- Service layer (auth, listings, profile, admin)
- Page/action components (require full app context)
- Toast integration (UI component provider)

**Strategy:** These require either real database or perfect Drizzle ORM mocking. Better tested via E2E with Playwright.

## Adding New Unit Tests

### For Validation Schemas
```typescript
// src/validation/__tests__/my-schema.test.ts
import { describe, it, expect } from "vitest"
import { mySchema } from "../my-schema"

describe("mySchema", () => {
  it("accepts valid input", () => {
    expect(mySchema.parse({ /* valid */ })).toEqual({ /* expected */ })
  })

  it("rejects invalid input", () => {
    expect(() => mySchema.parse({ /* invalid */ })).toThrow()
  })
})
```

### For Hooks
```typescript
// src/hooks/__tests__/my-hook.test.ts
import { renderHook, act } from "@testing-library/react"
import { myHook } from "../my-hook"

describe("myHook", () => {
  it("should initialize correctly", () => {
    const { result } = renderHook(() => myHook())
    expect(result.current.value).toBe(/* initial */)
  })

  it("should update on action", () => {
    const { result } = renderHook(() => myHook())
    act(() => { result.current.doSomething() })
    expect(result.current.value).toBe(/* updated */)
  })
})
```

### For Components
```typescript
// src/components/__tests__/my-component.test.tsx
import { render, screen } from "@testing-library/react"
import MyComponent from "../my-component"

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText("Test")).toBeVisible()
  })
})
```

## Configuration

### vitest.config.ts
- **Pool:** Threads (for memory stability)
- **Environment:** jsdom (for React component testing)
- **Isolation:** true (each test in separate context)
- **Coverage:** All files reported, 50% lines/statements, 40% functions/branches minimum

### src/test/setup.ts
Global mocks for:
- Next.js: headers, cache, navigation, cookies
- Supabase: server and client SDKs
- Drizzle: database query builder

These mocks ensure tests are **fast, isolated, and don't hit the database**.

## Common Issues & Solutions

### ❌ "Cannot find module '@/...'"
**Solution:** Ensure `vitest.config.ts` has the alias plugin for `@/` paths.

### ❌ "Worker out of memory"
**Solution:** Increased to 2GB in package.json test script. If still issues, reduce test parallelization in vitest.config.ts.

### ❌ "Real database connection attempted"
**Solution:** File is likely testing service layer. Move to `.skip` folder and test via E2E instead.

### ❌ "Test times out"
**Solution:** Check for unresolved promises or infinite loops. Mock external dependencies (API calls, timers).

## Next Phase: E2E Testing

See **E2E_TESTING_STRATEGY.md** for:
- Setting up Playwright
- Page Object Model pattern
- Test data management
- CI/CD integration

Priority flows to test:
1. **Auth:** Sign up → Login → Dashboard → Logout
2. **Marketplace:** Browse → Filter → Create listing
3. **Profile:** Edit → Save → Verify
4. **Admin:** Login as admin → Manage users/listings

## Questions?

Refer to:
- `UNIT_TESTING_STRATEGY.md` - Philosophy and best practices
- `E2E_TESTING_STRATEGY.md` - End-to-end testing approach
- `TESTING_IMPLEMENTATION_STATUS.md` - Current status and decisions
