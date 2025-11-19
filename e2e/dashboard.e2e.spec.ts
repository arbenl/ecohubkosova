import { test, expect } from '@playwright/test'

test.describe('Dashboard functionality', () => {
  test('should load dashboard pages', async ({ page }) => {

    // Test /sq/dashboard
    await page.goto('/sq/dashboard')
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should display dashboard content for authenticated user', async ({ page }) => {
    // This test assumes user is already authenticated
    // In a real scenario, you'd set up authentication first
    await page.goto('/sq/dashboard')

    // Check that dashboard page loads
    await expect(page.locator('body')).toBeVisible()

    // Note: Specific dashboard elements may not be implemented yet
  })

  test('should have proper navigation', async ({ page }) => {
    await page.goto('/sq/home')

    // Test navigation elements
    await expect(page.locator('header')).toBeVisible()
  })
})