import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/sq/home')
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')
    // Check for the main header element
    await expect(page.locator('header')).toBeVisible()
  })
})