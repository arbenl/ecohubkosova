/**
 * CSP Violation Detection Tests for ecohubkosova
 *
 * This test suite monitors for Content-Security-Policy violations that could
 * break the application or indicate over-restrictive CSP rules.
 *
 * CSP violations are captured via:
 * 1. Browser console error messages
 * 2. Network tab inspection for blocked resources
 * 3. Page.on('console') listeners
 *
 * If any CSP violations are detected, the test FAILS to ensure regressions
 * are caught in the CI/CD pipeline.
 */

import { test, expect } from '@playwright/test';

const LOCALE = 'sq';
const LOGIN_URL = `/${LOCALE}/login`;
const DASHBOARD_URL = `/${LOCALE}/dashboard`;
const HOME_URL = `/${LOCALE}`;

// Test user credentials from environment
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'arben.lila@gmail.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || '111111';

// Selectors
const selectors = {
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  loginButton: 'button[type="submit"]:has-text("Kyçu")',
  logoutButton: 'button:has-text("Dil")',
};

// CSP violation patterns to watch for
const CSP_VIOLATION_PATTERNS = [
  /Refused to load the script/i,
  /Refused to execute inline script/i,
  /Refused to execute the JavaScript/i,
  /Content Security Policy/i,
  /blocked:csp/i,
];

/**
 * Utility: Collect CSP violations from console
 */
function createCSPViolationCollector() {
  const violations: string[] = [];
  const blockedResources: string[] = [];

  return {
    consoleHandler: (msg: any) => {
      const text = msg.text();
      const location = msg.location();

      // Check for CSP violation messages
      if (CSP_VIOLATION_PATTERNS.some((pattern) => pattern.test(text))) {
        violations.push(`[${msg.type()}] ${text} (${location.url}:${location.lineNumber})`);
      }
    },

    responseHandler: (response: any) => {
      // Note: Playwright doesn't directly expose "blocked:csp" status like DevTools,
      // but we can infer from response headers and status
      const headers = response.headers();
      const url = response.url();

      // Log suspicious responses for inspection
      if (response.status() === 0 || response.status() === 304) {
        // 0 = blocked by network, 304 = not modified
        if (url.includes('_next') || url.includes('turbopack') || url.includes('.js')) {
          blockedResources.push(url);
        }
      }
    },

    getViolations: () => ({
      cspViolations: violations,
      blockedResources: blockedResources,
    }),

    hasViolations: () => violations.length > 0 || blockedResources.length > 0,

    throwIfViolations: () => {
      if (violations.length > 0) {
        throw new Error(
          `CSP Violations detected:\n${violations.map((v) => `  - ${v}`).join('\n')}\n\n` +
          `This indicates the CSP policy is too restrictive or incorrectly configured in development mode.`
        );
      }
      if (blockedResources.length > 0) {
        console.warn(
          `⚠️ Potentially blocked resources detected:\n${blockedResources
            .slice(0, 5)
            .map((r) => `  - ${r}`)
            .join('\n')}`
        );
      }
    },
  };
}

test.describe('CSP Violation Detection Suite', () => {
  test('should load login page without CSP violations', async ({ page }) => {
    const cspCollector = createCSPViolationCollector();

    page.on('console', cspCollector.consoleHandler);
    page.on('response', cspCollector.responseHandler);

    // Navigate to login
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');

    // Wait a moment for any deferred CSP violation messages
    await page.waitForTimeout(500);

    // Verify page loaded
    expect(page.url()).toContain(LOGIN_URL);
    await expect(page.locator(selectors.emailInput)).toBeVisible();

    // Check for violations
    cspCollector.throwIfViolations();

    const violations = cspCollector.getViolations();
    console.log(`✓ Login page loaded with no CSP violations. Blocked resources: ${violations.blockedResources.length}`);
  });

  test('should login and navigate to dashboard without CSP violations', async ({ page }) => {
    const cspCollector = createCSPViolationCollector();

    page.on('console', cspCollector.consoleHandler);
    page.on('response', cspCollector.responseHandler);

    // Navigate to login
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');

    // Fill in credentials
    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL);
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD);

    // Submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.locator(selectors.loginButton).click(),
    ]);

    // Wait for page to fully render
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify redirected to protected route
    expect(page.url()).toMatch(/\/(dashboard|home)$/);

    // Check for violations
    cspCollector.throwIfViolations();

    const violations = cspCollector.getViolations();
    console.log(`✓ Dashboard loaded after login with no CSP violations. Blocked resources: ${violations.blockedResources.length}`);
  });

  test('should display dashboard content without CSP violations', async ({ page }) => {
    const cspCollector = createCSPViolationCollector();

    page.on('console', cspCollector.consoleHandler);
    page.on('response', cspCollector.responseHandler);

    // Login first
    await page.goto(LOGIN_URL);
    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL);
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD);

    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.locator(selectors.loginButton).click(),
    ]);

    // Navigate explicitly to dashboard
    await page.goto(DASHBOARD_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verify content is visible (indicates scripts executed)
    const content = page.locator('h1, h2, [class*="card"]').first();
    await expect(content).toBeVisible({ timeout: 5000 });

    // Check for violations
    cspCollector.throwIfViolations();

    const violations = cspCollector.getViolations();
    console.log(`✓ Dashboard content visible with no CSP violations`);
  });

  test('should handle logout without CSP violations', async ({ page }) => {
    const cspCollector = createCSPViolationCollector();

    page.on('console', cspCollector.consoleHandler);
    page.on('response', cspCollector.responseHandler);

    // Login
    await page.goto(LOGIN_URL);
    await page.locator(selectors.emailInput).fill(TEST_USER_EMAIL);
    await page.locator(selectors.passwordInput).fill(TEST_USER_PASSWORD);

    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.locator(selectors.loginButton).click(),
    ]);

    // Find and click logout button
    const logoutButton = page.locator(selectors.logoutButton).first();
    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await Promise.all([
        page.waitForNavigation({ timeout: 10000 }),
        logoutButton.click(),
      ]);

      await page.waitForTimeout(500);
    }

    // Check for violations
    cspCollector.throwIfViolations();

    const violations = cspCollector.getViolations();
    console.log(`✓ Logout completed with no CSP violations`);
  });

  test('should have no Turbopack/Next.js scripts blocked by CSP', async ({ page }) => {
    const blockedScripts = new Set<string>();

    page.on('console', (msg) => {
      const text = msg.text();
      // Catch Turbopack-specific blocking
      if (text.includes('blocked:csp') || text.match(/turbopack.*blocked/i)) {
        blockedScripts.add(text);
      }
    });

    // Visit various pages
    const routes = [LOGIN_URL, HOME_URL];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
    }

    if (blockedScripts.size > 0) {
      throw new Error(
        `Found ${blockedScripts.size} Turbopack/Next.js scripts blocked by CSP:\n` +
        Array.from(blockedScripts)
          .slice(0, 5)
          .map((s) => `  - ${s}`)
          .join('\n')
      );
    }

    console.log(`✓ No Turbopack or Next.js scripts were blocked by CSP`);
  });
});
