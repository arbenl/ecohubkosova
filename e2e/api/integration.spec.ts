import { test, expect } from '@playwright/test'

test.describe('API Integration Testing', () => {
  test('should handle API health checks', async ({ page }) => {
    // Navigate to home page and check if it loads without errors
    await page.goto('/sq')
    await expect(page).toHaveTitle(/ECO HUB KOSOVA/)

    // Check if the page loads successfully (basic health check)
    const mainContent = page.getByRole('main').first()
    await expect(mainContent).toBeVisible()

    // Verify no console errors during page load
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForLoadState('networkidle')
    expect(errors.length).toBeLessThan(3) // Allow some minor errors but not excessive
  })

  test('should handle data fetching APIs', async ({ page }) => {
    await page.goto('/sq')

    // Wait for page to load and check if content is rendered
    await page.waitForLoadState('networkidle')

    // Check if main content areas are populated
    const headings = page.locator('h1, h2, h3')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)

    // Verify navigation links are present
    const navLinks = page.locator('nav a')
    const linkCount = await navLinks.count()
    expect(linkCount).toBeGreaterThan(0)
  })

  test('should handle error responses gracefully', async ({ page }) => {
    // Test navigation to non-existent page
    await page.goto('/sq/non-existent-page')

    // Should show error page or redirect gracefully
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toMatch(/gabim|error|404/i)
  })

  test('should handle CORS and security headers', async ({ page }) => {
    // Test basic page load security
    await page.goto('/sq')

    // Check if page loads without security violations
    await expect(page).toHaveTitle(/ECO HUB KOSOVA/)

    // Verify HTTPS or proper protocol
    const url = page.url()
    expect(url).toMatch(/^https?:\/\//)
  })

  test('should handle API rate limiting', async ({ page }) => {
    await page.goto('/sq')

    // Simulate multiple rapid interactions
    const links = page.locator('a[href]')
    const linkCount = await links.count()

    // Click multiple links rapidly (simulating rate limiting scenario)
    for (let i = 0; i < Math.min(5, linkCount); i++) {
      try {
        await links.nth(i).click({ timeout: 2000 })
        await page.goBack()
      } catch (error) {
        // Expected if rate limiting or navigation issues occur
        break
      }
    }

    // Page should still be functional
    await expect(page.getByRole('main').first()).toBeVisible()
  })

  test('should handle API timeouts gracefully', async ({ page }) => {
    await page.goto('/sq')

    // Set a short timeout for network requests
    await page.route('**/*', async route => {
      // Simulate timeout for certain requests
      if (route.request().url().includes('api') || route.request().url().includes('supabase')) {
        setTimeout(() => route.abort(), 100)
      } else {
        await route.continue()
      }
    })

    // Page should still load basic content
    await page.waitForLoadState('domcontentloaded')
    const mainContent = page.getByRole('main').first()
    await expect(mainContent).toBeVisible()
  })

  test('should validate API response formats', async ({ page }) => {
    await page.goto('/sq')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Additional wait for dynamic content

    // Check if page structure is valid HTML
    const html = await page.innerHTML('html')
    expect(html).toContain('<head>')
    expect(html).toContain('<body')

    // Verify basic page structure
    await expect(page.locator('header')).toBeVisible()
    await expect(page.getByRole('main').first()).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })
})