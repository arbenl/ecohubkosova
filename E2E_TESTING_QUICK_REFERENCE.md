# E2E Testing Quick Reference Card

## All Files Created

| File | Purpose |
|------|---------|
| **`e2e/auth.e2e.spec.ts`** | Main E2E test suite (11 test cases) |
| **`E2E_AUTH_TESTING_GUIDE.md`** | Complete testing guide & best practices |
| **`E2E_TROUBLESHOOTING.md`** | Debugging for common issues |
| **`E2E_DATABASE_SEEDING_DRIZZLE.md`** | Database seeding with Drizzle + Supabase |
| **`E2E_TESTING_SUMMARY.md`** | Overview & getting started |
| **`run-e2e-tests.sh`** | Interactive bash script (executable) |
| **`E2E_TESTING_QUICK_REFERENCE.md`** | This file |

---

## Quick Commands

```bash
# 1. Set test credentials
export TEST_USER_EMAIL="admin@test.local"
export TEST_USER_PASSWORD="TestPassword123!"

# 2. Seed test database (using Drizzle)
export NODE_ENV=test
pnpm db:reset:test
pnpm db:push:test
pnpm db:seed:test

# 3. Start dev server
pnpm dev

# 4. Run E2E tests
# Option A: Interactive menu
./run-e2e-tests.sh

# Option B: Run all tests
pnpm exec playwright test e2e/auth.e2e.spec.ts

# Option C: Run one test
pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-001"

# Option D: Headed mode (see browser)
pnpm exec playwright test e2e/auth.e2e.spec.ts --headed

# Option E: Debug mode (interactive)
pnpm exec playwright test e2e/auth.e2e.spec.ts --debug

# 5. View test report
pnpm exec playwright show-report
```

---

## One-Liner: Full E2E Flow

```bash
export NODE_ENV=test TEST_USER_EMAIL="admin@test.local" && \
pnpm db:reset:test && pnpm db:push:test && pnpm db:seed:test && \
pnpm exec playwright test e2e/auth.e2e.spec.ts --headed
```

---

## Test Cases Overview

```
TC-001 ✅ Login with valid credentials
TC-002 ❌ Login with invalid credentials  
TC-003 🔐 Access dashboard after login
TC-004 🚫 Deny unauthenticated access
TC-005 👋 Logout and redirect
TC-006 🔒 Deny dashboard after logout
TC-007 🔄 Complete user journey
TC-008 ⚠️  Empty form validation
TC-009 🔗 Session persistence
TC-010 🐢 Slow network handling
TC-011 ⚡ Performance benchmark
```

**Run**: `pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-001"`

---

## Environment Variables

### Development (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DB_URL=postgresql://user:pass@localhost:54322/postgres
```

### Testing (`.env.test`)
```bash
NODE_ENV=test
TEST_DB=true
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
# OR for remote test DB
SUPABASE_DB_URL=postgresql://user:pass@your-test-db.supabase.co:5432/postgres
```

---

## Architecture Overview

```
┌─ Package.json Scripts
│  ├─ db:reset:test    → scripts/reset-test-db.sh
│  ├─ db:push:test     → drizzle-kit push (migrations)
│  ├─ db:seed:test     → src/db/seed.ts (deterministic data)
│  └─ e2e              → pnpm playwright test
│
├─ playwright.config.ts
│  └─ globalSetup() → runs seeding before tests
│
├─ e2e/auth.e2e.spec.ts
│  └─ 11 test cases covering login → browse → logout
│
└─ Documentation
   ├─ E2E_AUTH_TESTING_GUIDE.md
   ├─ E2E_DATABASE_SEEDING_DRIZZLE.md
   ├─ E2E_TROUBLESHOOTING.md
   └─ E2E_TESTING_SUMMARY.md
```

---

## Workflow: Local Development

```bash
# 1. First time setup
pnpm install
pnpm exec playwright install --with-deps

# 2. Create test database (Supabase local or PostgreSQL)
# Option A: Supabase local
supabase start

# Option B: PostgreSQL
brew services start postgresql

# 3. Seed test DB
export NODE_ENV=test
pnpm db:reset:test && pnpm db:push:test && pnpm db:seed:test

# 4. Start app in separate terminal
pnpm dev

# 5. Run tests
pnpm exec playwright test e2e/auth.e2e.spec.ts

# 6. View results
pnpm exec playwright show-report
```

---

## Workflow: CI/CD (GitHub Actions)

```yaml
env:
  NODE_ENV: test
  SUPABASE_DB_URL: postgresql://postgres:postgres@localhost:5432/postgres_test

jobs:
  seed-and-test:
    - pnpm db:reset:test && pnpm db:push:test && pnpm db:seed:test
    - pnpm build
    - pnpm e2e
```

---

## Test Data After Seeding

| Email | Role | Org |
|-------|------|-----|
| admin@test.local | admin | Test Organization |
| viewer@test.local | user | None |
| member@test.local | user | Test Organization |

**IDs** (fixed, deterministic):
- Admin: `11111111-1111-1111-1111-111111111111`
- Viewer: `22222222-2222-2222-2222-222222222222`
- Member: `33333333-3333-3333-3333-333333333333`
- Org: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`

---

## Selectors Reference

### Login Page
```typescript
selectors.emailInput = 'input[type="email"]'
selectors.passwordInput = 'input[type="password"]'
selectors.loginButton = 'button:has-text("Kyçu")'        // Login (Albanian)
selectors.googleButton = 'button:has-text("Kyçu me Google")'
```

### Dashboard
```typescript
selectors.dashboardHeading = 'h1, h2, [class*="dashboard"]'
selectors.dashboardContent = '[class*="card"], [class*="stats"]'
```

### Header/Logout
```typescript
selectors.signOutButton = 'button:has-text("Dilni")'     // Sign Out (Albanian)
selectors.profileMenu = '[data-testid="profile-menu"]'
```

---

## Debugging Checklist

- [ ] `pnpm dev` running on http://localhost:3000
- [ ] Test DB is accessible: `psql $SUPABASE_DB_URL -c "SELECT 1"`
- [ ] Seeding completed: `pnpm db:seed:test` succeeded
- [ ] Test users exist: Check database or auth console
- [ ] Environment variables set: `echo $TEST_USER_EMAIL`
- [ ] Playwright browsers installed: `pnpm exec playwright install`

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Login timeout | Test user doesn't exist | Create user via `/sq/register` or auth admin |
| Sign-out button not found | Selector changed | Run `--headed` to see actual button |
| Dashboard accessible without login | Middleware bug | Check `middleware.ts` has `/dashboard` in PROTECTED_PREFIXES |
| Tests fail in CI but pass locally | Env vars not set | Add to GitHub Actions `env:` section |
| Database connection refused | DB not running | Start with `supabase start` or `brew services start postgresql` |
| SAFETY ABORT | Using production DB | Verify `.env.test` has `_test` in URL |

---

## Performance Targets

| Action | Expected | Timeout |
|--------|----------|---------|
| Navigate to login | < 2s | 5s |
| Fill form + submit | < 1s | 5s |
| Login complete | < 5s | 10s |
| Access dashboard | < 2s | 5s |
| Logout complete | < 3s | 5s |
| Full flow (TC-007) | < 15s | 30s |

---

## Files You Can Delete (Optional Cleanup)

If you had previous E2E test attempts:
```bash
rm -f e2e/auth/login.spec.ts       # Old tests (keep if working)
rm -f e2e/auth/logout.spec.ts      # Old tests (keep if working)
rm -f e2e/auth/signup.spec.ts      # Old tests (keep if working)
```

We've consolidated everything into `e2e/auth.e2e.spec.ts`.

---

## Adding More Tests

Template for new E2E test:

```typescript
// e2e/auth.e2e.spec.ts
test('TC-012: Your test name', async ({ page }) => {
  // Setup
  await page.goto(LOGIN_URL)
  
  // Action
  await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL)
  
  // Assert
  await expect(page.locator(selectors.emailInput)).toHaveValue(TEST_USER_EMAIL)
  
  // Log for debugging
  console.log('✓ Test passed')
})
```

---

## Extending to Other Routes

To test marketplace, profile, or admin routes:

```typescript
// Add new URLs
const MARKETPLACE_URL = `/${LOCALE}/marketplace`
const PROFILE_URL = `/${LOCALE}/profile`
const ADMIN_URL = `/${LOCALE}/admin`

// Add new test
test('TC-013: User can access marketplace', async ({ page }) => {
  await page.goto(LOGIN_URL)
  // ... login ...
  await page.goto(MARKETPLACE_URL)
  await expect(page.locator('[class*="marketplace"]')).toBeVisible()
})
```

---

## Documentation Index

1. **Quick Start**: Read `E2E_TESTING_SUMMARY.md` first
2. **Setup & Run**: Follow `E2E_AUTH_TESTING_GUIDE.md`
3. **Database**: Read `E2E_DATABASE_SEEDING_DRIZZLE.md`
4. **Debugging**: Check `E2E_TROUBLESHOOTING.md` if tests fail

---

## Support

When asking for help, provide:
1. Test name (TC-001, etc.)
2. Error message (full)
3. Screenshot from `test-results/`
4. Output from `pnpm db:seed:test`
5. URL where test failed

```bash
# Collect info
cd /Users/arbenlila/development/ecohubkosova
pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-001" --headed
# Take screenshot
# Check: test-results/*, playwright-report/
```

---

## Next: What to Do After Tests Pass

- ✅ All 11 tests pass locally
- [ ] Add more protected routes to test coverage
- [ ] Add accessibility tests (keyboard, screen reader)
- [ ] Add mobile responsiveness tests
- [ ] Integrate into CI/CD pipeline
- [ ] Add performance monitoring
- [ ] Set up alerts for test failures
- [ ] Document in team wiki

---

*Last Updated: November 17, 2025*  
*For ecohubkosova (Next.js + Playwright + Drizzle + Supabase)*
