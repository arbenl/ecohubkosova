# E2E Testing with CSP Violation Detection - Complete Setup Guide

## Overview

This guide walks through the complete E2E testing setup for `ecohubkosova` with integrated CSP violation detection.

## Architecture

```
┌─────────────────┐
│ next.config.mjs │  ← Environment-aware CSP (dev permissive, prod strict)
└────────┬────────┘
         │
         ↓
┌────────────────────────┐
│ Playwright Tests       │
├────────────────────────┤
│ • auth.e2e.spec.ts     │  ← Main auth flow tests + CSP monitoring
│ • csp-detection.e2e.ts │  ← Dedicated CSP violation detection
└────────┬───────────────┘
         │
         ↓
┌────────────────────────┐
│ Browser (Chromium)     │
├────────────────────────┤
│ • Console monitoring   │  ← Catches CSP violation messages
│ • Network inspection   │  ← Detects blocked resources
│ • Session/Cookie check │  ← Verifies auth success
└────────────────────────┘
```

## File Structure

```
ecohubkosova/
├── next.config.mjs                  # CSP configuration (dev + prod)
├── middleware.ts                    # Auth middleware
├── playwright.config.ts             # Playwright configuration
├── .env.test                        # Test environment variables
├── e2e/
│   ├── auth.e2e.spec.ts            # Auth flow + CSP monitoring (8 tests)
│   ├── csp-detection.e2e.spec.ts   # Dedicated CSP tests (5 tests)
│   └── global-setup.ts             # Global test setup
├── CSP_FIX_GUIDE.md                # Detailed CSP explanation
├── CSP_QUICK_REFERENCE.md          # Quick reference
└── E2E_TESTING_COMPLETE_SETUP.md   # This file
```

## Setup Instructions

### 1. Environment Variables

Create `.env.test` (if not already done):

```bash
# Copy template
cp .env.test.example .env.test

# Edit with your test credentials
TEST_USER_EMAIL=arben.lila@gmail.com
TEST_USER_PASSWORD=111111
TEST_LOCALE=sq
TEST_BASE_URL=http://localhost:3000
```

### 2. Start Dev Server

```bash
# Terminal 1: Start Next.js dev server
pnpm dev

# Output should show:
# ✓ Ready in XXXms
# - Local: http://localhost:3000
```

### 3. Run E2E Tests

```bash
# Terminal 2: Run all E2E tests
export SKIP_WEB_SERVER=1  # Use existing dev server
pnpm exec playwright test e2e/auth.e2e.spec.ts

# Or run specific test file:
pnpm exec playwright test e2e/csp-detection.e2e.spec.ts
```

## Test Files Explained

### `/e2e/auth.e2e.spec.ts` (8 tests)

**Purpose**: Verify auth flow works WITHOUT CSP violations

**Tests**:

- `TC-001`: Login with valid credentials
- `TC-002`: Invalid credentials error handling
- `TC-003`: Protected route access (dashboard)
- `TC-004`: Unauthenticated redirect to login
- `TC-005`: Logout functionality
- `TC-006`: Home page loading
- `TC-007`: Multiple route navigation
- `TC-008`: CSS/images loading

**CSP Monitoring**:

```typescript
const csp = setupCSPMonitoring(page)
// ... test code ...
csp.throwIfViolations() // ❌ Fails if CSP blocks anything
```

### `/e2e/csp-detection.e2e.spec.ts` (5 tests)

**Purpose**: Dedicated CSP violation detection

**Tests**:

- `should load login page without CSP violations`
- `should login and navigate to dashboard without CSP violations`
- `should display dashboard content without CSP violations`
- `should handle logout without CSP violations`
- `should have no Turbopack/Next.js scripts blocked by CSP`

**Advanced Monitoring**:

- Console message tracking
- Network response inspection
- Blocked resource detection
- Multiple route traversal

## Running Tests

### Run All Tests

```bash
export SKIP_WEB_SERVER=1
pnpm exec playwright test e2e/
```

### Run Specific File

```bash
# Only auth tests
pnpm exec playwright test e2e/auth.e2e.spec.ts

# Only CSP tests
pnpm exec playwright test e2e/csp-detection.e2e.spec.ts
```

### Run Specific Test

```bash
# Only TC-001
pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-001"

# Only home page CSP test
pnpm exec playwright test e2e/csp-detection.e2e.spec.ts -g "should load login page"
```

### Watch Mode (Headed)

```bash
# Run with browser visible
pnpm exec playwright test e2e/auth.e2e.spec.ts --headed --workers=1

# Debug mode (breakpoints enabled)
pnpm exec playwright test e2e/auth.e2e.spec.ts --debug
```

### Generate HTML Report

```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts
pnpm exec playwright show-report
```

## Output Examples

### ✅ All Tests Passing

```
Running 8 tests using 5 workers

✓ TC-001 Login successful, no CSP violations
✓ TC-002 Invalid credentials handled, no CSP violations
✓ TC-003 Dashboard accessible, no CSP violations
✓ TC-004 Unauthenticated redirect works, no CSP violations
✓ TC-005 Logout completed, no CSP violations
✓ TC-006 Home page loads, no CSP violations
✓ TC-007 Multiple routes accessible, no CSP violations
✓ TC-008 CSS loads successfully, no CSP violations

8 passed (8.3s) ✓
```

### ❌ CSP Violation Detected

```
Error: ❌ CSP Violations detected:
  - [error] Refused to load the script '/_next/...turbopack...js'
    because it violates the Content Security Policy directive...

Fix: Ensure next.config.mjs dev CSP includes 'unsafe-eval',
'unsafe-inline', blob:, and http:/https:/ws: sources
```

## CI/CD Integration

### Add npm Scripts to `package.json`

```json
{
  "scripts": {
    "test:e2e": "playwright test e2e/",
    "test:e2e:auth": "playwright test e2e/auth.e2e.spec.ts",
    "test:e2e:csp": "playwright test e2e/csp-detection.e2e.spec.ts",
    "test:e2e:report": "playwright show-report"
  }
}
```

### GitHub Actions Workflow

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Start dev server
        run: pnpm dev > /dev/null 2>&1 &

      - name: Wait for server
        run: sleep 10

      - name: Run E2E tests
        run: |
          export SKIP_WEB_SERVER=1
          pnpm test:e2e

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Timeout

**Problem**: Tests hang at `waitForNavigation` or `waitForLoadState`

**Solution**:

```bash
# 1. Check dev server is running
curl http://localhost:3000/sq

# 2. Restart dev server
pkill -f "next dev"
pnpm dev

# 3. Wait for server to be ready
sleep 5

# 4. Run tests with verbose output
pnpm exec playwright test e2e/auth.e2e.spec.ts --reporter=list
```

### CSP Violations Still Appearing

**Problem**: Tests show "Refused to load" errors

**Solution**:

```bash
# 1. Verify next.config.mjs has dev CSP with:
grep -A 10 "const devCsp" next.config.mjs

# 2. Check for these required sources:
#    - 'unsafe-eval'
#    - 'unsafe-inline'
#    - blob:
#    - ws: wss:

# 3. Restart dev server
pkill -f "next dev"
pnpm dev
```

### Test Database Not Seeding

**Problem**: Login fails because test user doesn't exist

**Solution**:

```bash
# 1. Check .env.test has correct credentials
cat .env.test | grep TEST_USER

# 2. Verify test user exists in Supabase:
# - Go to https://app.supabase.com
# - Select your project
# - Authentication → Users
# - Look for TEST_USER_EMAIL

# 3. If missing, create it via script:
node scripts/create-test-user.mjs
```

### Playwright Cache Issues

**Problem**: Old test results or cached data causing issues

**Solution**:

```bash
# Clear playwright cache
rm -rf .playwright

# Reinstall browsers
pnpm exec playwright install

# Clear test results
rm -rf test-results/
rm -rf playwright-report/
```

## Best Practices

### 1. Always Clear Auth State Between Tests

```typescript
test.beforeEach(async ({ page }) => {
  await page.context().clearCookies()
  try {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  } catch (e) {}
})
```

### 2. Use Explicit Waits

```typescript
// ✅ Good
await Promise.all([
  page.waitForNavigation({ timeout: 15000 }),
  page.locator(selectors.loginButton).click(),
])

// ❌ Avoid
await page.locator(selectors.loginButton).click()
await page.waitForTimeout(2000)
```

### 3. Monitor CSP in Every Test

```typescript
// ✅ Always add CSP monitoring
const csp = setupCSPMonitoring(page)
// ... test ...
csp.throwIfViolations()
```

### 4. Use Environment Variables

```typescript
// ✅ From environment
const EMAIL = process.env.TEST_USER_EMAIL || "default@test.local"

// ❌ Hardcoded
const EMAIL = "hardcoded@test.local"
```

## Performance Tips

### Run Tests in Parallel

```bash
# Default: 5 workers (faster)
pnpm exec playwright test e2e/auth.e2e.spec.ts

# Single worker (slower, but simpler debugging)
pnpm exec playwright test e2e/auth.e2e.spec.ts --workers=1
```

### Filter Tests

```bash
# Only run CSP tests (faster subset)
pnpm exec playwright test -g "CSP"

# Skip long tests
pnpm exec playwright test -g "TC-0[1-5]"  # Only TC-001 through TC-005
```

## Next Steps

1. **Run tests locally**: `pnpm test:e2e`
2. **Add to CI/CD**: Use GitHub Actions workflow above
3. **Monitor CSP regressions**: Check test results in each PR
4. **Expand test coverage**: Add tests for new auth flows

## Support

- **CSP Questions**: See `CSP_FIX_GUIDE.md`
- **Playwright Docs**: https://playwright.dev/docs/intro
- **Supabase Auth**: https://supabase.com/docs/guides/auth

---

**Status**: ✅ Ready for development and CI/CD integration
