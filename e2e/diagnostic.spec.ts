import { test, expect } from '@playwright/test'

test.describe('Diagnostic Tests', () => {
  test('should load main pages without hanging', async ({ page }) => {
    test.setTimeout(15000)

    const pages = ['/sq/home']

    for (const pagePath of pages) {
      await page.goto(pagePath, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('body')).toBeVisible()
      await expect(page).toHaveURL(pagePath)
    }
  })

  test('should handle basic navigation', async ({ page }) => {
    test.setTimeout(10000)

    await page.goto('/sq/home', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('body')).toBeVisible()
  })
})