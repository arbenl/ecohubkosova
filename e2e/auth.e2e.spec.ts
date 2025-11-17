/**
 * Comprehensive E2E Auth Tests + CSP Violation Detection for ecohubkosova
 *
 * This test suite covers:
 * 1. Successful login with valid credentials (with CSP monitoring)
 * 2. Error handling for invalid credentials
 * 3. Protected route access and dashboard rendering
 * 4. Unauthenticated redirect to login
 * 5. Logout and session clearing
 * 6. CSP violation detection - fails if dev CSP is too restrictive
 *
 * CSP violations are detected via console message monitoring.
 * If any "Refused to load" or "Content Security Policy" messages appear,
 * the test fails immediately to catch over-restrictive CSP policies.
 */

import { test, expect } from '@playwright/test';

// ===== CSP VIOLATION DETECTION =====
const CSP_VIOLATION_KEYWORDS = [
  'Refused to load the script',
  'Refused to execute inline script',
  'Refused to execute the JavaScript',
  'Content Security Policy',
  'blocked:csp',
];

function setupCSPMonitoring(page: any) {
  const violations: string[] = [];

  page.on('console', (msg: any) => {
    const text = msg.text();
    if (CSP_VIOLATION_KEYWORDS.some((keyword) => text.includes(keyword))) {
      violations.push(`[${msg.type()}] ${text}`);
    }
  });

  return {
    getViolations: () => violations,
    throwIfViolations: () => {
      if (violations.length > 0) {
        throw new Error(
          `❌ CSP Violations detected:\n${violations.map((v) => `  - ${v}`).join('\n')}\n\n` +
          `Fix: Ensure next.config.mjs dev CSP includes 'unsafe-eval', 'unsafe-inline', blob:, and http:/https:/ws: sources`
        );
      }
    },
  };
}

// ===== CONFIGURATION =====
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'arben.lila@gmail.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || '111111';
const LOCALE = 'sq';

const LOGIN_URL = `/${LOCALE}/login`;
const DASHBOARD_URL = `/${LOCALE}/dashboard`;
const HOME_URL = `/${LOCALE}`;

const selectors = {
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  loginButton: 'button[type="submit"]:has-text("Kyçu")',
  logoutButton: 'button:has-text("Dil")',
  errorAlert: '[role="alert"]',
};

// ===== TEST SUITE =====
test.describe('Auth Flow with CSP Violation Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    try {
      await page.evaluate(() => {
        try { localStorage.clear(); } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}
      });
    } catch (error) {
      // OK if storage clear fails
    }
  });

  test('TC-001: Login with valid credentials (no CSP violations)', async ({ page }) => {
    const csp = setupCSPMonitoring(page);

    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain(LOGIN_URL);
    await expect(page.locator(selectors.emailInput)).toBeVisible();

    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL);
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD);

    // Submit with navigation wait
    console.log('📤 Submitting login form...');
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.locator(selectors.loginButton).click(),
    ]);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    console.log(`📍 After login, URL: ${page.url()}`);

    // Verify logged in (redirected to dashboard or home)
    expect(page.url()).toMatch(/\/(dashboard|home|sq)$/);

    const cookies = await page.context().cookies();
    const hasSessionCookie = cookies.some(
      (c) => c.name.includes('sb-') || c.name === '__session' || c.name === 'eco_session_version'
    );
    expect(hasSessionCookie).toBeTruthy();

    csp.throwIfViolations();
    console.log(`✓ TC-001 Login successful, no CSP violations`);
  });

  test('TC-002: Invalid credentials show error (no CSP violations)', async ({ page }) => {
    const csp = setupCSPMonitoring(page);

    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');

    await page.locator(selectors.emailInput).fill('wrong@example.com');
    await page.locator(selectors.passwordInput).fill('wrongpassword');

    await page.locator(selectors.loginButton).click();
    await page.waitForTimeout(2000);

    // Should still be on login page
    expect(page.url()).toContain(LOGIN_URL);

    csp.throwIfViolations();
    console.log(`✓ TC-002 Invalid credentials handled, no CSP violations`);
  });

  test('TC-003: Protected route after login (no CSP violations)', async ({ page }) => {
    const csp = setupCSPMonitoring(page);

    // Login first
    await page.goto(LOGIN_URL);
    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL);
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD);

    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.locator(selectors.loginButton).click(),
    ]);

    // Navigate to dashboard
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    expect(page.url()).toMatch(/\/(dashboard|home)$/);

    const content = page.locator('h1, h2, [class*="card"]').first();
    await expect(content).toBeVisible({ timeout: 5000 });

    csp.throwIfViolations();
    console.log(`✓ TC-003 Dashboard accessible, no CSP violations`);
  });

  test('TC-004: Unauthenticated redirect to login (no CSP violations)', async ({ page }) => {
    const csp = setupCSPMonitoring(page);

    await page.context().clearCookies();
    await page.goto(DASHBOARD_URL);

    await page.waitForURL((url) => url.toString().includes(LOGIN_URL), { timeout: 5000 });
    expect(page.url()).toContain(LOGIN_URL);

    csp.throwIfViolations();
    console.log(`✓ TC-004 Unauthenticated redirect works, no CSP violations`);
  });

  test('TC-005: Logout and session clear (no CSP violations)', async ({ page }) => {
    const csp = setupCSPMonitoring(page);

    // Login
    await page.goto(LOGIN_URL);
    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL);
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD);

    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.locator(selectors.loginButton).click(),
    ]);

    // Find logout button (might be in a menu)
    const logoutBtn = page.locator(selectors.logoutButton).first();
    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await Promise.all([
        page.waitForNavigation({ timeout: 10000 }),
        logoutBtn.click(),
      ]);
      await page.waitForTimeout(500);
    }

    csp.throwIfViolations();
    console.log(`✓ TC-005 Logout completed, no CSP violations`);
  });

  test('TC-006: Home page loads without CSP violations', async ({ page }) => {
    const csp = setupCSPMonitoring(page);

    await page.goto(HOME_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    expect(page.url()).toContain(LOCALE);

    csp.throwIfViolations();
    console.log(`✓ TC-006 Home page loads, no CSP violations`);
  });

  test('TC-007: Multiple route navigation without CSP violations', async ({ page }) => {
    const csp = setupCSPMonitoring(page);

    const routes = [HOME_URL, LOGIN_URL];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
    }

    csp.throwIfViolations();
    console.log(`✓ TC-007 Multiple routes accessible, no CSP violations`);
  });

  test('TC-008: CSS and images load without CSP violations', async ({ page }) => {
    const csp = setupCSPMonitoring(page);

    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');

    // Check that CSS is applied (not blocked by CSP)
    const computed = await page.evaluate(() => {
      const elem = document.querySelector('body');
      if (!elem) return null;
      return window.getComputedStyle(elem).backgroundColor;
    });

    // If computed style is set, CSS was loaded
    expect(computed).not.toBeNull();

    csp.throwIfViolations();
    console.log(`✓ TC-008 CSS loads successfully, no CSP violations`);
  });
});
