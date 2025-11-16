import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/sq');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/ECO HUB KOSOVA/);
});

test('get started link', async ({ page }) => {
  // Navigate to marketplace with locale prefix
  await page.goto('/sq/marketplace');

  // Wait for content to load
  await page.waitForTimeout(1000);

  // Check that the marketplace heading exists
  const heading = page.locator('h1:has-text("Tregu i Ekonomisë Qarkulluese")');
  await expect(heading).toBeVisible();
});
