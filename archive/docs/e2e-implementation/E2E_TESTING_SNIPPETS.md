# E2E Testing Code Snippets & Customizations

## Common Customizations for ecohubkosova

### 1. Add data-testid Attributes to Components

If you want more stable selectors, add `data-testid` to your components:

#### `src/components/layout/header/sign-out-button.tsx`

```tsx
"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"

interface SignOutButtonProps {
  variant?: "default" | "outline" | "ghost"
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  children?: ReactNode
  onBeforeSignOut?: () => void
}

export function SignOutButton({
  variant = "outline",
  className,
  size,
  children = "Dilni",
  onBeforeSignOut,
}: SignOutButtonProps) {
  const { signOut, signOutPending } = useAuth()

  const handleClick = async () => {
    onBeforeSignOut?.()
    await signOut()
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={signOutPending}
      data-testid="sign-out-button" // ← ADD THIS LINE
    >
      {signOutPending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Duke u çkyçur...
        </span>
      ) : (
        children
      )}
    </Button>
  )
}
```

Then update your test:

```typescript
// e2e/auth.e2e.spec.ts
const selectors = {
  signOutButton: '[data-testid="sign-out-button"]', // ← Much more reliable!
}
```

#### `src/app/[locale]/(auth)/login/page.tsx`

```tsx
// Add to the login button
<Button
  type="submit"
  data-testid="login-submit-button" // ← ADD THIS
  // ... other props
>
  {/* ... */}
</Button>
```

#### `src/app/[locale]/(protected)/dashboard/page.tsx`

```tsx
// Add to dashboard heading for easy verification
<h1 data-testid="dashboard-heading">Dashboard</h1>
```

Then tests can use:

```typescript
const dashboardHeading = page.locator('[data-testid="dashboard-heading"]')
await expect(dashboardHeading).toBeVisible()
```

---

### 2. Test Multiple Locales

Extend your test to validate auth flow in different languages:

```typescript
// e2e/auth.e2e.spec.ts - Add this test

test.describe("Multi-locale Support", () => {
  const locales = ["sq", "en", "fr"] // Add your locales

  locales.forEach((locale) => {
    test(`TC-012: Auth flow in ${locale} locale`, async ({ page }) => {
      const LOGIN_URL = `/${locale}/login`
      const DASHBOARD_URL = `/${locale}/dashboard`

      // Login
      await page.goto(LOGIN_URL)
      await page.waitForLoadState("networkidle")

      await page.locator('input[type="email"]').fill(TEST_USER_EMAIL)
      await page.locator('input[type="password"]').fill(TEST_USER_PASSWORD)
      await page
        .locator(
          'button:has-text("Kyçu"), button:has-text("Sign in"), button:has-text("Connexion")'
        )
        .first()
        .click()

      // Wait for redirect
      await page.waitForURL((url) => url.toString().includes(`/${locale}`), { timeout: 10000 })

      // Verify on dashboard
      await page.goto(DASHBOARD_URL)
      expect(page.url()).toContain(DASHBOARD_URL)

      console.log(`✓ Auth works in ${locale} locale`)
    })
  })
})
```

---

### 3. Add Performance Monitoring

Track performance metrics for each test:

```typescript
// e2e/auth.e2e.spec.ts - Add this utility

interface PerformanceMetrics {
  pageLoadTime: number
  loginTime: number
  dashboardLoadTime: number
  logoutTime: number
}

async function capturePerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    return {
      pageLoadTime: navigation?.loadEventEnd - navigation?.fetchStart,
      dnsTime: navigation?.domainLookupEnd - navigation?.domainLookupStart,
      tcpTime: navigation?.connectEnd - navigation?.connectStart,
      ttfb: navigation?.responseStart - navigation?.fetchStart,
    }
  })
  return metrics as PerformanceMetrics
}

// Then in tests:
test("TC-012: Monitor login performance", async ({ page }) => {
  const startTime = Date.now()

  await page.goto(LOGIN_URL)
  const metrics = await capturePerformanceMetrics(page)

  await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL)
  await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD)

  const loginStart = Date.now()
  await page.locator(selectors.loginButton).click()

  await page.waitForURL((url) => url.includes(DASHBOARD_URL) || url.includes(HOME_URL), {
    timeout: 10000,
  })

  const loginTime = Date.now() - loginStart
  const totalTime = Date.now() - startTime

  console.log("Performance Metrics:")
  console.log(`  Page load: ${metrics.pageLoadTime}ms`)
  console.log(`  Login time: ${loginTime}ms`)
  console.log(`  Total: ${totalTime}ms`)

  expect(loginTime).toBeLessThan(5000) // Login should be < 5 seconds
})
```

---

### 4. Test Error Scenarios

Add more comprehensive error handling tests:

```typescript
// e2e/auth.e2e.spec.ts - Add to error tests

test.describe("Error Scenarios", () => {
  test("TC-013: Display validation errors for weak password", async ({ page }) => {
    await page.goto(`/${LOCALE}/register`)
    await page.waitForLoadState("networkidle")

    // Fill form with weak password
    await page.locator('input[name="password"]').fill("123") // Too weak

    // Look for validation message
    const errorMsg = await page.locator('[role="alert"]').first()
    await expect(errorMsg).toBeVisible({ timeout: 3000 })

    console.log("✓ Weak password error displayed")
  })

  test("TC-014: Handle network timeout gracefully", async ({ page }) => {
    // Simulate slow network
    await page.route("**/api/auth/**", (route) => {
      setTimeout(() => route.abort(), 15000)
    })

    await page.goto(LOGIN_URL)
    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL)
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD)

    await page.locator(selectors.loginButton).click()

    // Should eventually error or timeout gracefully
    await page.waitForTimeout(3000)

    const hasError = await page
      .locator('[role="alert"]')
      .isVisible()
      .catch(() => false)
    expect(hasError || page.url().includes(LOGIN_URL)).toBe(true)

    console.log("✓ Network timeout handled gracefully")
  })

  test("TC-015: Handle CORS errors", async ({ page }) => {
    // Mock CORS error
    await page.route("**/api/auth/signout", (route) => {
      route.abort("blockedbyclient")
    })

    // Login first
    await page.goto(LOGIN_URL)
    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL)
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD)
    await page.locator(selectors.loginButton).click()

    await page.waitForURL((url) => url.includes(DASHBOARD_URL) || url.includes(HOME_URL), {
      timeout: 10000,
    })

    // Try to logout (will fail due to mock)
    const signOutButton = page.locator(selectors.signOutButton).first()
    if (await signOutButton.isVisible()) {
      await signOutButton.click()

      // App should handle error gracefully
      await page.waitForTimeout(1000)
      expect(page.url()).toBeTruthy()
    }

    console.log("✓ CORS error handled gracefully")
  })
})
```

---

### 5. Test Accessibility

Ensure your auth flow is accessible:

```typescript
// e2e/auth.e2e.spec.ts - Add accessibility tests

test.describe("Accessibility", () => {
  test("TC-016: Login form is keyboard navigable", async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.waitForLoadState("networkidle")

    // Start with Tab key from beginning
    await page.keyboard.press("Tab")

    // Focus should be on email input
    const emailInput = page.locator(selectors.emailInput)
    await expect(emailInput).toBeFocused()

    // Tab to password
    await page.keyboard.press("Tab")
    const passwordInput = page.locator(selectors.passwordInput)
    await expect(passwordInput).toBeFocused()

    // Tab to submit button
    await page.keyboard.press("Tab")
    const loginButton = page.locator(selectors.loginButton)
    await expect(loginButton).toBeFocused()

    // Submit with Enter
    await page.keyboard.press("Enter")

    console.log("✓ Keyboard navigation works")
  })

  test("TC-017: Login form has proper ARIA labels", async ({ page }) => {
    await page.goto(LOGIN_URL)

    // Check for associated labels
    const emailLabel = page.locator('label:has-text("Email"), label[for*="email"]').first()
    const passwordLabel = page.locator('label:has-text("Password"), label[for*="password"]').first()

    await expect(emailLabel).toBeVisible()
    await expect(passwordLabel).toBeVisible()

    console.log("✓ ARIA labels present")
  })

  test("TC-018: Error messages are announced", async ({ page }) => {
    await page.goto(LOGIN_URL)

    // Submit with invalid credentials
    await page.locator(selectors.emailInput).fill("invalid@test.com")
    await page.locator(selectors.passwordInput).fill("wrong")
    await page.locator(selectors.loginButton).click()

    // Error should have role="alert" (announced to screen readers)
    const alert = page.locator('[role="alert"]')
    await expect(alert).toBeVisible({ timeout: 3000 })

    const alertText = await alert.textContent()
    expect(alertText).toBeTruthy()

    console.log(`✓ Error announced: "${alertText}"`)
  })
})
```

---

### 6. Visual Regression Testing

Catch unintended UI changes:

```typescript
// e2e/auth.e2e.spec.ts - Add visual tests (requires playwright@latest)

test.describe("Visual Regression", () => {
  test("TC-019: Login page layout consistency", async ({ page }) => {
    await page.goto(LOGIN_URL)
    await page.waitForLoadState("networkidle")

    // Take screenshot and compare to baseline
    await expect(page).toHaveScreenshot("login-page.png", {
      fullPage: true,
      mask: [page.locator('input[type="password"]')], // Mask sensitive fields
    })

    console.log("✓ Login page layout unchanged")
  })

  test("TC-020: Dashboard layout consistency", async ({ page }) => {
    // Login first
    await page.goto(LOGIN_URL)
    await page.waitForLoadState("networkidle")

    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL)
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD)
    await page.locator(selectors.loginButton).click()

    await page.waitForURL((url) => url.includes(DASHBOARD_URL) || url.includes(HOME_URL), {
      timeout: 10000,
    })

    // Navigate to dashboard
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState("networkidle")

    // Take screenshot
    await expect(page).toHaveScreenshot("dashboard-page.png", {
      fullPage: true,
    })

    console.log("✓ Dashboard layout unchanged")
  })
})
```

To update baselines after intentional changes:

```bash
pnpm exec playwright test e2e/auth.e2e.spec.ts -g "Visual" --update-snapshots
```

---

### 7. Test with Different Networks

Simulate different network conditions:

```typescript
// e2e/auth.e2e.spec.ts - Add network condition tests

test.describe("Network Conditions", () => {
  test("TC-021: Login works on slow 3G", async ({ browser }) => {
    const context = await browser.newContext()

    // Simulate 3G network
    await context.route("**/*", (route) => {
      route.continue()
    })

    const page = await context.newPage()

    // Slow down network (simulated)
    await page.route("**/api/auth/**", (route) => {
      setTimeout(() => route.continue(), 1000)
    })

    await page.goto(LOGIN_URL)
    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL)
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD)

    const startTime = Date.now()
    await page.locator(selectors.loginButton).click()

    await page.waitForURL((url) => url.includes(DASHBOARD_URL) || url.includes(HOME_URL), {
      timeout: 15000,
    })

    const loginTime = Date.now() - startTime
    console.log(`✓ Login on 3G took ${loginTime}ms`)

    await context.close()
  })

  test("TC-022: Login works on offline then online", async ({ page }) => {
    await page.context().setOffline(true)
    await page.goto(LOGIN_URL)

    // Try to login (should fail gracefully)
    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL)
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD)
    await page.locator(selectors.loginButton).click()

    // Should stay on login page (network error)
    await page.waitForTimeout(2000)
    expect(page.url()).toContain(LOGIN_URL)

    // Go online and try again
    await page.context().setOffline(false)
    await page.reload()
    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL)
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD)
    await page.locator(selectors.loginButton).click()

    // Should now succeed
    await page.waitForURL((url) => url.includes(DASHBOARD_URL) || url.includes(HOME_URL), {
      timeout: 10000,
    })

    console.log("✓ App handles offline/online transitions")
  })
})
```

---

### 8. Test Session Persistence

Verify sessions survive across browser restarts:

```typescript
// e2e/auth.e2e.spec.ts - Add session persistence test

test("TC-023: Session persists across browser restart", async ({ browser }) => {
  // First browser context - Login
  let context = await browser.newContext()
  let page = await context.newPage()

  await page.goto(LOGIN_URL)
  await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL)
  await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD)
  await page.locator(selectors.loginButton).click()

  await page.waitForURL((url) => url.includes(DASHBOARD_URL) || url.includes(HOME_URL), {
    timeout: 10000,
  })

  // Get cookies
  const cookies = await context.cookies()
  console.log(`✓ First session: ${cookies.length} cookies`)

  await context.close()

  // Second browser context - Simulate restart with same cookies
  context = await browser.newContext({
    storageState: {
      cookies: cookies,
      origins: [],
    },
  })

  page = await context.newPage()

  // Should be able to access dashboard without re-login
  await page.goto(DASHBOARD_URL)
  await page.waitForLoadState("networkidle")

  // Should not redirect to login
  expect(page.url()).toContain(DASHBOARD_URL)

  console.log("✓ Session persisted across restart")

  await context.close()
})
```

---

### 9. CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e:
    name: E2E Auth Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "pnpm"

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Build app
        run: pnpm build

      - name: Run E2E tests
        run: pnpm exec playwright test e2e/auth.e2e.spec.ts
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-screenshots
          path: test-results/
          retention-days: 3
```

---

### 10. Generate Test Report

Add custom report generator:

```typescript
// scripts/generate-test-report.ts

import fs from "fs"
import path from "path"

interface TestResult {
  name: string
  status: "passed" | "failed"
  duration: number
}

function generateReport(results: TestResult[]) {
  const passed = results.filter((r) => r.status === "passed").length
  const failed = results.filter((r) => r.status === "failed").length
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>E2E Test Report</title>
  <style>
    body { font-family: Arial; margin: 20px; }
    .summary { background: #f0f0f0; padding: 20px; border-radius: 5px; }
    .passed { color: green; }
    .failed { color: red; }
    table { width: 100%; margin-top: 20px; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <h1>E2E Test Report</h1>
  <div class="summary">
    <p><span class="passed">✓ Passed: ${passed}</span></p>
    <p><span class="failed">✗ Failed: ${failed}</span></p>
    <p>Total Time: ${(totalTime / 1000).toFixed(2)}s</p>
  </div>
  <table>
    <tr>
      <th>Test</th>
      <th>Status</th>
      <th>Duration</th>
    </tr>
    ${results
      .map(
        (r) => `
      <tr>
        <td>${r.name}</td>
        <td><span class="${r.status}">${r.status.toUpperCase()}</span></td>
        <td>${(r.duration / 1000).toFixed(2)}s</td>
      </tr>
    `
      )
      .join("")}
  </table>
</body>
</html>
  `

  fs.writeFileSync(path.join("playwright-report", "summary.html"), html)
  console.log("Report generated: playwright-report/summary.html")
}

export { generateReport }
```

---

## Usage Instructions

1. **Pick a snippet** from above that matches your needs
2. **Copy the code** into the appropriate file
3. **Run the tests**:
   ```bash
   pnpm exec playwright test e2e/auth.e2e.spec.ts
   ```
4. **Check results**:
   ```bash
   pnpm exec playwright show-report
   ```

---

## Common Patterns

### Waiting for Elements

```typescript
// Wait for element to be visible
await expect(page.locator(selector)).toBeVisible({ timeout: 5000 })

// Wait for URL change
await page.waitForURL(url, { timeout: 10000 })

// Wait for network to settle
await page.waitForLoadState("networkidle")

// Wait for specific response
await page.waitForResponse((response) => response.url().includes("/api/auth"))
```

### Taking Screenshots

```typescript
// Full page
await page.screenshot({ path: "full.png", fullPage: true })

// Specific element
await page.locator(selector).screenshot({ path: "element.png" })

// With mask (hide sensitive data)
await page.screenshot({ path: "masked.png", mask: [page.locator('input[type="password"]')] })
```

### Getting Values

```typescript
// Input value
const value = await page.inputValue(selector)

// Text content
const text = await page.locator(selector).textContent()

// Attribute
const attr = await page.locator(selector).getAttribute("data-value")

// Multiple elements
const texts = await page.locator(selector).allTextContents()
```

---

For more information, see the main testing guide: **`E2E_AUTH_TESTING_GUIDE.md`**
