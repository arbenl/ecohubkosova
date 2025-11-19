import { test, expect } from '@playwright/test'

test.describe('Example Usage', () => {
  test('should load homepage without hanging', async ({ page }) => {
    test.setTimeout(10000)

    await page.goto('/sq/home', { waitUntil: 'domcontentloaded' })

    // Just verify basic page structure loads
    await expect(page.locator('body')).toBeVisible()
    await expect(page).toHaveURL('/sq/home')
  })
})