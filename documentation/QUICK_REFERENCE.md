# Quick Reference - EcoHub Testing

## Current Status (Nov 15, 2025)

| Metric | Value |
|--------|-------|
| **Tests Passing** | 157/157 ✅ |
| **Test Files** | 21 files |
| **Current Coverage** | 30-40% |
| **Target Coverage** | 80% |
| **Branch** | testing |
| **Phase** | 1 Complete, Phase 2 Ready |

## Coverage by Module

| Module | Tests | Coverage | Status |
|--------|-------|----------|--------|
| Validation | 89 | 95% | ✅ Complete |
| Service Layer | 21 | 50% | �� Partial |
| Server Actions | 20 | 60% | 🟡 Partial |
| Auth & Utils | 10 | 30% | 🔴 Limited |
| Pages & Components | 0 | 0% | ❌ Missing |
| API Routes | 0 | 0% | ❌ Missing |
| Hooks | 0 | 0% | ❌ Missing |

## Key Commands

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Run specific test file
pnpm test src/validation/__tests__/auth.test.ts

# Watch mode
pnpm test -- --watch

# Generate HTML coverage report
pnpm test -- --coverage
open coverage/index.html
```

## Project Structure

```
src/
├── validation/
│   └── __tests__/ ............ 95% covered ✅
│       ├── auth.test.ts (18 tests)
│       ├── profile.test.ts (19 tests)
│       ├── listings.test.ts (18 tests)
│       └── admin.test.ts (34 tests)
├── services/
│   └── __tests__/ ............ 50% covered 🟡
├── app/
│   ├── (private)/**/actions.test.ts ... 60% 🟡
│   └── (auth), (public), api/ ......... 0% ❌
├── components/
│   └── __tests__/ ............. 30% covered 🔴
├── hooks/ ..................... 0% covered ❌
└── lib/
    └── __tests__/ ............. 30% covered 🔴
```

## Phase Roadmap

### Phase 1 ✅ COMPLETE (Week 1)
- Validation schema tests (89 tests)
- Testing framework setup
- Coverage analysis

### Phase 2 ⏳ IN QUEUE (Weeks 2-3)
- API endpoint tests
- Service layer error paths
- Authorization testing
- Target: +15-20% (reach 45-60%)

### Phase 3 ⏳ PLANNED (Weeks 3-5)
- Component tests
- Hook tests
- Form validation UI
- Target: +15-20% (reach 60-80%)

### Phase 4 ⏳ PLANNED (Weeks 5-6)
- E2E workflows
- Complex scenarios
- Edge cases
- Target: +10-15% (reach 80%+)

## Documentation

- **TESTING_STRATEGY.md** - Comprehensive 4-phase plan
- **COVERAGE_ANALYSIS.md** - Gap analysis & priorities
- **Test Examples** - 4 Phase 1 test files showing patterns

## Priority for Phase 2

### High Impact (Do First)
1. API endpoints (+8-10%)
2. Service layer errors (+5-8%)
3. Authorization (+3-5%)

### Medium Impact
1. Components (+10-15%)
2. Hooks (+3-5%)

### Lower Impact
1. E2E tests (+10-15%)
2. Edge cases (+5-10%)

## Testing Patterns

### Validation Tests
```typescript
import { z } from "zod"
import { loginSchema } from "@/validation/auth"

describe("auth validation", () => {
  it("validates login schema", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123"
    })
    expect(result.success).toBe(true)
  })
})
```

### Service Tests
```typescript
vi.mock("@/lib/supabase-server")
describe("services", () => {
  it("handles errors", async () => {
    vi.mocked(db.select).mockRejectedValueOnce(
      new Error("offline")
    )
    // Test error handling
  })
})
```

### Action Tests
```typescript
vi.mock("@/services")
describe("actions", () => {
  it("validates input", async () => {
    const result = await updateProfile(invalidData)
    expect(result).toHaveProperty("error")
  })
})
```

## Git Workflow

```bash
# Current branch
git branch  # shows: testing

# View commits
git log --oneline | head -5

# Create new feature branch from testing
git checkout -b phase2-apis

# After Phase 4 complete, merge back
git checkout testing
git merge [final-branch]
git checkout main
git merge testing
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests not running | `pnpm install` then `pnpm test` |
| Coverage not generating | Coverage provider installed: ✅ |
| Test timeouts | Increase timeout: `{ timeout: 10000 }` |
| Mock not working | Use `vi.mock()` from vitest |
| Module not found | Check path alias in vitest.config.ts |

## Contact Points

- **Branch**: testing (development)
- **Test Config**: vitest.config.ts
- **Strategy Docs**: TESTING_STRATEGY.md
- **Gap Analysis**: COVERAGE_ANALYSIS.md

---

**Last Updated**: November 15, 2025  
**Current Phase**: 1 Complete, Phase 2 Ready  
**Target**: 80%+ coverage by end of Phase 4
