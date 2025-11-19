import { test, expect } from '@playwright/test'

test.describe('Marketplace Browse', () => {
  test('should show marketplace shell without hanging', async ({ page }) => {
    test.setTimeout(15000)

    await page.goto('/sq/marketplace', { waitUntil: 'domcontentloaded' })

    // Shell is visible immediately
    await expect(page.locator('body')).toBeVisible()
    await expect(page).toHaveURL(/\/sq\/marketplace/)
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')

    // Test passes if we get here without hanging
    console.log('✅ Marketplace shell loaded successfully')
  })
})