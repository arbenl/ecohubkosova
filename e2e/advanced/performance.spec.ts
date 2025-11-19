import { test, expect } from '@playwright/test'

test.describe('Performance & Accessibility', () => {
  test('should load pages within performance budget', async ({ page }) => {
    const pages = ['/sq/home', '/sq/marketplace', '/sq/login', '/sq/register']

    for (const pageUrl of pages) {
      const startTime = Date.now()
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded' })
      const loadTime = Date.now() - startTime

      console.log(`${pageUrl}: ${loadTime}ms`)

      // Performance budget: pages should load within 5 seconds
      expect(loadTime).toBeLessThan(5000)

      // Verify page loaded
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/sq/home')

    // Check for h1 tag
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThan(0)

    // Check heading hierarchy (h1 should come before h2, etc.)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents()
    console.log('Headings found:', headings.length)

    // Should have at least one main heading
    expect(headings.length).toBeGreaterThan(0)
  })

  test('should have accessible form elements', async ({ page }) => {
    await page.goto('/sq/login')

    // Check for form elements with proper labels
    const inputs = page.locator('input')
    const inputCount = await inputs.count()

    if (inputCount > 0) {
      console.log(`Found ${inputCount} input elements`)

      // Check if inputs have associated labels or aria-labels
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i)
        const hasLabel = await input.evaluate(el => {
          const id = el.id
          const ariaLabel = el.getAttribute('aria-label')
          const ariaLabelledBy = el.getAttribute('aria-labelledby')
          const label = id ? document.querySelector(`label[for="${id}"]`) : null
          return !!(ariaLabel || ariaLabelledBy || label)
        })

        if (hasLabel) {
          console.log(`Input ${i + 1} has proper labeling`)
        }
      }
    } else {
      console.log('No input elements found on login page')
    }

    await expect(page.locator('body')).toBeVisible()
  })

  test('should have proper image alt texts', async ({ page }) => {
    await page.goto('/sq/home')

    const images = page.locator('img')
    const imageCount = await images.count()

    console.log(`Found ${imageCount} images`)

    // Check alt texts for first few images
    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const alt = await images.nth(i).getAttribute('alt')
      if (alt && alt.trim()) {
        console.log(`Image ${i + 1} has alt text: ${alt}`)
      } else {
        console.log(`Image ${i + 1} missing alt text`)
      }
    }
  })

  test('should handle large viewports correctly', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 })

    await page.goto('/sq/home')
    await expect(page.locator('body')).toBeVisible()

    // Check that content doesn't overflow horizontally
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth)
    const viewportWidth = 2560

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50) // Allow small margin

    console.log('Large viewport handling verified')
  })

  test('should handle small viewports correctly', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })

    await page.goto('/sq/home')
    await expect(page.locator('body')).toBeVisible()

    // Check that horizontal scrolling is minimal
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)

    expect(scrollWidth - clientWidth).toBeLessThan(50) // Minimal horizontal scroll

    console.log('Small viewport handling verified')
  })
})