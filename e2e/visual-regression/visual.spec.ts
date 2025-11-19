import { test, expect } from '@playwright/test'

test.describe('Visual Regression Testing', () => {
  test('should maintain consistent home page layout', async ({ page }) => {
    await page.goto('/sq/home')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Take screenshot of main content area
    await expect(page.locator('body')).toHaveScreenshot('home-page-layout.png', {
      threshold: 0.1 // Allow 10% difference for minor variations
    })
  })

  test('should maintain consistent marketplace layout', async ({ page }) => {
    await page.goto('/sq/marketplace')

    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')

    // Take screenshot excluding dynamic content
    await expect(page.locator('main')).toHaveScreenshot('marketplace-layout.png', {
      threshold: 0.1
    })
  })

  test('should maintain consistent login form layout', async ({ page }) => {
    await page.goto('/sq/login')

    // Wait for form to load
    await page.waitForLoadState('domcontentloaded')

    // Take screenshot of form area
    const formArea = page.locator('body')
    await expect(formArea).toHaveScreenshot('login-form-layout.png', {
      threshold: 0.05 // Stricter threshold for forms
    })
  })

  test('should maintain consistent header across pages', async ({ page }) => {
    const pages = ['/sq/home', '/sq/marketplace', '/sq/login']

    for (const pageUrl of pages) {
      await page.goto(pageUrl)
      await page.waitForLoadState('domcontentloaded')

      // Take screenshot of header only
      await expect(page.locator('header')).toHaveScreenshot(`header-${pageUrl.split('/').pop()}.png`, {
        threshold: 0.02 // Very strict for header consistency
      })
    }
  })

  test('should handle responsive layouts correctly', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/sq/home')
      await page.waitForLoadState('networkidle')

      // Take full page screenshot for each viewport
      await expect(page.locator('body')).toHaveScreenshot(`home-${viewport.name}-layout.png`, {
        threshold: 0.1
      })
    }
  })

  test('should maintain consistent button styles', async ({ page }) => {
    await page.goto('/sq/home')

    // Find all buttons and take screenshots of their styles
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    if (buttonCount > 0) {
      // Take screenshot of first button as reference
      await expect(buttons.first()).toHaveScreenshot('button-style-reference.png', {
        threshold: 0.01 // Very strict for button consistency
      })
    }
  })

  test('should maintain consistent form input styles', async ({ page }) => {
    await page.goto('/sq/login')

    // Find input elements
    const inputs = page.locator('input')
    const inputCount = await inputs.count()

    if (inputCount > 0) {
      // Take screenshot of first input as reference
      await expect(inputs.first()).toHaveScreenshot('input-style-reference.png', {
        threshold: 0.01
      })
    }
  })

  test('should handle loading states consistently', async ({ page }) => {
    await page.goto('/sq/marketplace')

    // Look for loading indicators
    const loadingIndicators = page.locator('text=Duke ngarkuar')
    if (await loadingIndicators.count() > 0) {
      // Take screenshot of loading state
      await expect(page.locator('body')).toHaveScreenshot('loading-state.png', {
        threshold: 0.05
      })
    }
  })

  test('should maintain consistent error states', async ({ page }) => {
    await page.goto('/sq/marketplace')

    // Check if error state is shown
    const errorElements = page.locator('text=Diçka shkoi keq')
    if (await errorElements.count() > 0) {
      // Take screenshot of error state
      await expect(page.locator('body')).toHaveScreenshot('error-state.png', {
        threshold: 0.05
      })
    }
  })
})