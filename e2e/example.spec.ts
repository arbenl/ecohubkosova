import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/ECO HUB KOSOVA/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Eksploro Tregun' }).click();

  // Expects page to have a heading with the name of the route.
  await expect(page.getByRole('heading', { name: 'Tregu' })).toBeVisible();
});