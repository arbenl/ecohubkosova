# E2E Auth Flow Testing Guide for ecohubkosova

## Overview

This guide explains how to run comprehensive end-to-end (E2E) tests for the ecohubkosova authentication flow using Playwright and TypeScript.

**Test File Location**: `e2e/auth.e2e.spec.ts`

## Test Coverage

The test suite covers these critical user journeys:

| Test ID | Test Name | Purpose |
|---------|-----------|---------|
| TC-001 | Login with valid credentials | Verify successful authentication |
| TC-002 | Login with invalid credentials | Verify error handling |
| TC-003 | Access dashboard after login | Verify protected route access |
| TC-004 | Deny unauthenticated dashboard access | Verify middleware protection |
| TC-005 | Logout and redirect | Verify session cleanup and redirect |
| TC-006 | Deny dashboard access after logout | Verify post-logout protection |
| TC-007 | Complete user journey | Full login → browse → logout flow |
| TC-008 | Handle empty form submission | Verify form validation |
| TC-009 | Maintain session across pages | Verify session persistence |
| TC-010 | Handle slow network timeout | Verify error handling |
| TC-011 | Performance: login time | Verify login completes < 10s |

## Prerequisites

### 1. Node.js and npm/pnpm
Ensure you have Node.js 18+ installed:
```bash
node --version  # Should be v18+
pnpm --version   # Should be installed
```

### 2. Playwright browsers
Install Playwright browsers:
```bash
pnpm exec playwright install
```

### 3. Test User Credentials
You need a test user account in your Supabase instance. Create one:
- Email: `test-user@example.com` (or use your preferred email)
- Password: `TestPassword123!` (or your preferred password)

**Important**: Use a dedicated test account, not a production user.

### 4. Next.js dev server running
Your app must be running locally:
```bash
pnpm dev
# or
npm run dev
```

The app should be accessible at `http://localhost:3000`

## Running the Tests

### Quick Start

1. **Set environment variables** (one-time):
```bash
export TEST_USER_EMAIL="test-user@example.com"
export TEST_USER_PASSWORD="TestPassword123!"
```

2. **Run all E2E tests**:
```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts
```

3. **Run a specific test**:
```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-001"
```

4. **Run in debug mode** (opens interactive debugging UI):
```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts --debug
```

5. **Run with visible browser** (headed mode):
```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts --headed
```

6. **Run in specific browser**:
```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts --project=chromium
pnpm exec playwright test e2e/auth.e2e.spec.ts --project=firefox
pnpm exec playwright test e2e/auth.e2e.spec.ts --project=webkit
```

### Advanced Options

**Run with traces and screenshots**:
```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts --trace on
```

**View HTML report after run**:
```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts
pnpm exec playwright show-report
```

**Run tests in parallel**:
```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts --workers=4
```

**Run tests sequentially** (useful for debugging):
```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts --workers=1
```

## Configuration

### Test Environment Variables

Update these in `e2e/auth.e2e.spec.ts` or set as environment variables:

```typescript
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test-user@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
const LOCALE = 'sq'; // Change to 'en', 'fr', etc.
```

### Playwright Config

Key settings in `playwright.config.ts`:

```typescript
use: {
  baseURL: 'http://localhost:3000',      // Your local dev server
  navigationTimeout: 15000,               // Time to wait for page navigation
  actionTimeout: 10000,                   // Time to wait for interactions
  trace: 'on-first-retry',               // Collect traces on failure
}

timeout: 30000,  // Global test timeout (30 seconds per test)
```

## Troubleshooting

### Test Failures and How to Debug

#### **Error: "Login failed - navigation did not occur within 10s"**

**Likely Causes**:
- Test user credentials are incorrect
- Supabase auth is misconfigured
- Network connectivity issue
- Middleware is not properly redirecting

**Debug Steps**:
1. Manually login to `http://localhost:3000/sq/login` with test credentials
2. Check browser console for JavaScript errors
3. Check server logs: `pnpm dev` output for auth errors
4. Verify Supabase URL and keys in `.env.local`
5. Run with `--debug` flag to step through:
   ```bash
   pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-001" --debug
   ```
6. Check the screenshot: `test-results/login-form.png`

#### **Error: "Sign-out button not found"**

**Likely Causes**:
- Logout button selector changed
- Header/menu structure is different
- Component has different data-testid

**Debug Steps**:
1. Run in headed mode to see where the button is:
   ```bash
   pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-005" --headed
   ```
2. Update the selector in the test:
   ```typescript
   // Current selector
   signOutButton: 'button:has-text("Dilni")',
   
   // Try alternative selectors:
   // signOutButton: '[data-testid="logout"]',
   // signOutButton: 'button[aria-label="Sign out"]',
   ```

#### **Error: "SECURITY ISSUE: Protected dashboard is accessible without authentication"**

**This is a critical bug!** Your middleware is not protecting the route.

**Steps to Fix**:
1. Check `middleware.ts`:
   ```typescript
   const PROTECTED_PREFIXES = ["/admin", "/dashboard", "/profile"];
   ```
   Ensure `/dashboard` is in the list.

2. Verify session check in middleware:
   ```typescript
   const isProtected = PROTECTED_PREFIXES.some((prefix) => 
     relativePathname.startsWith(prefix)
   );
   
   if (isProtected && !hasSession) {
     return NextResponse.redirect(new URL(loginUrl, req.url));
   }
   ```

3. Check Supabase session retrieval:
   ```typescript
   const { data: { session } } = await supabase.auth.getSession();
   const hasSession = Boolean(session);
   ```

#### **Error: "Unauthenticated user not redirected to login"**

**Possible Causes**:
- Middleware not running for that route
- Route pattern doesn't match protected prefixes
- Middleware is returning wrong response

**Debug Steps**:
1. Add logging to middleware:
   ```typescript
   console.log('Protected route check:', {
     path: relativePathname,
     isProtected,
     hasSession,
   });
   ```
2. Restart dev server: `pnpm dev`
3. Rerun test with debug logs visible

#### **Error: "TypeError: page.locator is not a function"**

**Cause**: Playwright API usage error.

**Solution**: Update selector to use correct Playwright syntax:
```typescript
// ✅ Correct
await page.locator('input[type="email"]').fill(TEST_USER_EMAIL);

// ❌ Wrong
await page.fill('input[type="email"]', TEST_USER_EMAIL);
```

### Selectors Not Working

If selectors can't find elements:

1. **Inspect the page in headed mode**:
   ```bash
   pnpm exec playwright test e2e/auth.e2e.spec.ts --headed --debug
   ```

2. **Use Playwright Inspector to find selectors**:
   - Click the "Pick locator" button in the Inspector
   - Click on the element on the page
   - See the recommended selector

3. **Update selectors in test**:
   ```typescript
   const selectors = {
     emailInput: 'input[name="email"]',      // Update if name changed
     loginButton: 'button:has-text("Kyçu")', // Update if text changed
     // ...
   };
   ```

### Network/Timing Issues

**Problem**: Tests pass locally but fail in CI/CD

**Solutions**:
1. Increase timeouts:
   ```typescript
   await page.waitForURL(url, { timeout: 15000 }); // Increase to 15s
   ```

2. Add retry logic:
   ```typescript
   for (let i = 0; i < 3; i++) {
     try {
       await page.locator(selectors.loginButton).click();
       break;
     } catch (e) {
       if (i === 2) throw e;
       await page.waitForTimeout(1000);
     }
   }
   ```

3. Use `waitForLoadState`:
   ```typescript
   await page.goto(LOGIN_URL);
   await page.waitForLoadState('networkidle');  // Wait for all network requests
   ```

## Common Selector Reference

### Login Page
```typescript
'input[type="email"]'              // Email input
'input[type="password"]'           // Password input
'button:has-text("Kyçu")'          // Login button (Albanian: "Kyçu" = "Login")
'button:has-text("Kyçu me Google")' // Google sign-in button
```

### Header/Navigation
```typescript
'button:has-text("Dilni")'        // Logout button (Albanian: "Dilni" = "Sign out")
'[data-testid="profile-menu"]'    // Profile menu
'header'                           // Header element
```

### Dashboard
```typescript
'h1'                              // Main heading
'[class*="dashboard"]'            // Dashboard container
'[class*="card"]'                 // Card components
```

### Alerts/Errors
```typescript
'[role="alert"]'                  // Alert messages
'[class*="error"]'                // Error elements
'[class*="success"]'              // Success messages
```

## Performance Benchmarks

Expected timings (adjust based on your requirements):

| Action | Expected Time | Timeout |
|--------|---------------|---------|
| Navigate to login page | < 2s | 5s |
| Fill form + submit | < 1s | 5s |
| Login complete (redirect) | < 5s | 10s |
| Access dashboard | < 2s | 5s |
| Logout complete | < 3s | 5s |
| **Full flow (TC-007)** | < 15s | 30s |

## Best Practices

### 1. Use data-testid Attributes
Add to your components to make selectors stable:
```tsx
<button data-testid="logout-button">Dilni</button>
```

Then use in tests:
```typescript
selectors.signOutButton: '[data-testid="logout-button"]'
```

### 2. Wait for Network Activity
```typescript
await page.waitForLoadState('networkidle');  // Best for auth checks
// or
await page.waitForLoadState('domcontentloaded');  // Faster but less reliable
```

### 3. Handle Async Operations
```typescript
// ❌ Don't do this (race condition)
await page.locator(selectors.loginButton).click();
await page.goto(DASHBOARD_URL);

// ✅ Do this (wait for redirect)
await page.locator(selectors.loginButton).click();
await page.waitForURL((url) => url.includes(DASHBOARD_URL), { timeout: 10000 });
```

### 4. Test in Isolation
Each test should be independent:
```typescript
test.beforeEach(async ({ page }) => {
  // Clear state before each test
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
});
```

### 5. Use Meaningful Assertions
```typescript
// ✅ Good: Clear error message
expect(cookiesAfterLogout.length).toBeLessThan(cookiesBeforeLogout.length);

// ❌ Vague: Just checks it exists
expect(page.url()).toBeTruthy();
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      
      - run: pnpm build
      - run: pnpm dev &
      - run: sleep 5  # Wait for dev server
      
      - run: pnpm exec playwright test e2e/auth.e2e.spec.ts
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Next Steps

1. **Run your first test**:
   ```bash
   export TEST_USER_EMAIL="your-email@example.com"
   export TEST_USER_PASSWORD="your-password"
   pnpm exec playwright test e2e/auth.e2e.spec.ts -g "TC-001" --headed
   ```

2. **Share any test failures** along with:
   - Error message and stack trace
   - Screenshot from `test-results/` directory
   - Output of `pnpm dev`

3. **I'll help you**:
   - Identify the root cause in your Next.js code
   - Provide specific code fixes
   - Update selectors if UI changed

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Inspector](https://playwright.dev/docs/inspector)
- [Next.js + Playwright Setup](https://nextjs.org/docs/testing)

---

**Ready to test?** Run:
```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts
```

**Got test failures?** Paste the error output and I'll debug! 🚀
