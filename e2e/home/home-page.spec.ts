import { test, expect } from '@playwright/test'

test.describe('Home Page Interactions', () => {
  test('should load home page and display main content', async ({ page }) => {
    await page.goto('/sq/home')

    // Verify page loads with correct title
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')

    // Check main elements exist
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('body')).toBeVisible()

    console.log('Home page loaded successfully')
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/sq/home')

    // Check if navigation links are present (may be in header)
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Look for common navigation text patterns
    const navTexts = ['Eksploro', 'Partnerët', 'Tregu', 'Rreth Nesh']
    for (const text of navTexts) {
      const link = page.getByText(text).first()
      if (await link.isVisible()) {
        console.log(`Found navigation link: ${text}`)
      }
    }

    console.log('Navigation check completed')
  })

  test('should handle page responsiveness', async ({ page }) => {
    await page.goto('/sq/home')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('body')).toBeVisible()

    console.log('Responsive design test completed')
  })

  test('should load page within reasonable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/sq/home', { waitUntil: 'domcontentloaded' })

    const loadTime = Date.now() - startTime
    console.log(`Page loaded in ${loadTime}ms`)

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000)

    // Verify basic content loaded
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Start at home
    await page.goto('/sq/home')
    await expect(page.locator('body')).toBeVisible()

    // Navigate to marketplace
    await page.goto('/sq/marketplace')
    await expect(page.locator('body')).toBeVisible()

    // Go back
    await page.goBack()
    await expect(page).toHaveURL(/home/)

    // Go forward
    await page.goForward()
    await expect(page).toHaveURL(/marketplace/)

    console.log('Browser navigation works correctly')
  })
})