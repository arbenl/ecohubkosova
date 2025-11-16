import { Page } from '@playwright/test';

/**
 * Generates a unique email for testing
 * Prevents test data collisions across test runs
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test.${timestamp}.${random}@example.com`;
}

/**
 * Waits for a specific amount of time
 * Use sparingly - prefer explicit wait conditions
 */
export async function waitForMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to check if element is visible and stable
 */
export async function isElementStable(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract error message from alert/error container
 */
export async function getErrorMessage(page: Page): Promise<string | null> {
  const errorSelectors = [
    '[role="alert"]',
    '.error',
    '.bg-red-50',
    '[class*="error"]',
  ];

  for (const selector of errorSelectors) {
    const element = page.locator(selector).first();
    if ((await element.count()) > 0) {
      return await element.textContent();
    }
  }

  return null;
}

/**
 * Helper to verify successful redirection
 */
export async function verifyRedirectedTo(page: Page, expectedUrl: string): Promise<boolean> {
  await page.waitForURL(expectedUrl, { timeout: 5000 });
  return page.url().includes(expectedUrl);
}
