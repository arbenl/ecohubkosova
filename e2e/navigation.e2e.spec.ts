import { test, expect } from '@playwright/test'

test.describe('Site navigation and routing', () => {
  test('should load navigation pages', async ({ page }) => {
    
    // Test /sq/home
    await page.goto('/sq/home')
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')
    await expect(page.locator('body')).toBeVisible()

    // Test /sq/explore
    await page.goto('/sq/explore')
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')
    await expect(page.locator('body')).toBeVisible()

    // Test /sq/marketplace
    await page.goto('/sq/marketplace')
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')
    await expect(page.locator('body')).toBeVisible()

    // Test /sq/about
    await page.goto('/sq/about')
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have proper navigation', async ({ page }) => {
    await page.goto('/sq/home')

    // Test navigation elements
    await expect(page.locator('header')).toBeVisible()
  })
})