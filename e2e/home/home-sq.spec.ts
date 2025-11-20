import { test, expect } from '@playwright/test'

test.describe('Albanian Home Page (/sq/home)', () => {
  test('should load Albanian home page and display main content', async ({ page }) => {
    await page.goto('/sq/home')

    // Verify page loads with correct title
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')

    // Check main elements exist
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('body')).toBeVisible()

    console.log('Albanian home page loaded successfully')
  })

  test('should display Albanian navigation links', async ({ page }) => {
    await page.goto('/sq/home')

    // Check if navigation links are present in Albanian
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Verify Albanian navigation text
    await expect(page.getByText('Eksploro')).toBeVisible()
    await expect(page.getByText('Partnerët')).toBeVisible()
    await expect(page.getByText('Tregu')).toBeVisible()
    await expect(page.getByText('Rreth Nesh')).toBeVisible()

    console.log('Albanian navigation links verified')
  })

  test('should handle page responsiveness', async ({ page }) => {
    await page.goto('/sq/home')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('body')).toBeVisible()

    console.log('Responsive design test completed for Albanian page')
  })

  test('should load page within reasonable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/sq/home', { waitUntil: 'domcontentloaded' })

    const loadTime = Date.now() - startTime
    console.log(`Albanian page loaded in ${loadTime}ms`)

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000)

    // Verify basic content loaded
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Start at Albanian home
    await page.goto('/sq/home')
    await expect(page.locator('body')).toBeVisible()

    // Navigate to Albanian marketplace
    await page.goto('/sq/marketplace')
    await expect(page.locator('body')).toBeVisible()

    // Go back
    await page.goBack()
    await expect(page).toHaveURL(/\/sq\/home/)

    // Go forward
    await page.goForward()
    await expect(page).toHaveURL(/\/sq\/marketplace/)

    console.log('Browser navigation works correctly for Albanian pages')
  })
})