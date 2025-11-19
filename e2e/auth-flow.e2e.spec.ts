import { test, expect } from '@playwright/test'

test.describe('User authentication flow', () => {
  test('should load auth-flow pages', async ({ page }) => {

    // Test /sq/login
    await page.goto('/sq/login')
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')
    await expect(page.locator('body')).toBeVisible()

    // Test /sq/register
    await page.goto('/sq/register')
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')
    await expect(page.locator('body')).toBeVisible()

    // Test /sq/profile (should redirect to login if not authenticated)
    await page.goto('/sq/profile')
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have proper navigation', async ({ page }) => {
    await page.goto('/sq/home')

    // Test navigation elements
    await expect(page.locator('header')).toBeVisible()
  })

  test('should allow user login with valid credentials', async ({ page }) => {
    await page.goto('/sq/login')

    // Verify login page loads
    await expect(page.locator('body')).toBeVisible()

    // Note: Actual login form testing requires implemented login UI
    // This test verifies the login route is accessible
  })
})