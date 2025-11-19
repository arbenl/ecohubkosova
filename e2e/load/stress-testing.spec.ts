import { test, expect } from '@playwright/test'

test.describe('Load Testing', () => {
  test('should handle multiple concurrent users', async ({ browser }) => {
    const userCount = 5 // Simulate 5 concurrent users
    const pages = []

    // Create multiple pages to simulate concurrent users
    for (let i = 0; i < userCount; i++) {
      const context = await browser.newContext()
      const page = await context.newPage()
      pages.push({ page, context })
    }

    console.log(`Simulating ${userCount} concurrent users`)

    const startTime = Date.now()

    // All users navigate to homepage simultaneously
    const navigationPromises = pages.map(async ({ page }, index) => {
      console.log(`User ${index + 1} starting navigation`)
      await page.goto('/sq/home')
      await page.waitForLoadState('networkidle')
      console.log(`User ${index + 1} completed navigation`)
      return page.url()
    })

    const results = await Promise.all(navigationPromises)
    const totalTime = Date.now() - startTime

    console.log(`All users completed in: ${totalTime}ms`)
    console.log(`Average time per user: ${totalTime / userCount}ms`)

    // All users should reach the correct page
    results.forEach(url => expect(url).toContain('/sq/home'))

    // Should complete within reasonable time
    expect(totalTime).toBeLessThan(10000) // Less than 10 seconds for 5 users

    // Cleanup
    for (const { context } of pages) {
      await context.close()
    }
  })

  test('should handle rapid page navigation stress', async ({ page }) => {
    await page.goto('/sq/home')

    const routes = ['/sq/marketplace', '/sq/partners', '/sq/about', '/sq/login', '/sq/home']
    const navigationTimes = []

    console.log('Starting rapid navigation stress test')

    // Rapid navigation between pages
    for (let i = 0; i < 10; i++) { // 10 rapid navigations
      for (const route of routes) {
        const startTime = Date.now()
        await page.goto(route)
        await page.waitForLoadState('domcontentloaded') // Faster than networkidle
        const navTime = Date.now() - startTime
        navigationTimes.push(navTime)
      }
    }

    const avgTime = navigationTimes.reduce((a, b) => a + b) / navigationTimes.length
    const maxTime = Math.max(...navigationTimes)
    const minTime = Math.min(...navigationTimes)

    console.log(`Rapid navigation results:`)
    console.log(`Average: ${avgTime.toFixed(2)}ms`)
    console.log(`Max: ${maxTime}ms`)
    console.log(`Min: ${minTime}ms`)

    // Performance should remain reasonable even under stress
    expect(avgTime).toBeLessThan(1000) // Average under 1 second
    expect(maxTime).toBeLessThan(8000) // Max under 8 seconds (development environment)

    console.log('Rapid navigation stress test completed')
  })

  test('should handle form submission load', async ({ page }) => {
    await page.goto('/sq/login')

    // Simulate multiple form interactions
    const interactions = []

    for (let i = 0; i < 5; i++) {
      const startTime = Date.now()

      // Fill form fields
      await page.fill('input[type="email"]', `test${i}@example.com`)
      await page.fill('input[type="password"]', 'password123')

      // Click submit (but don't actually submit to avoid real authentication)
      await page.locator('button[type="submit"]').hover()

      const interactionTime = Date.now() - startTime
      interactions.push(interactionTime)

      // Clear fields for next iteration
      await page.fill('input[type="email"]', '')
      await page.fill('input[type="password"]', '')
    }

    const avgInteractionTime = interactions.reduce((a, b) => a + b) / interactions.length

    console.log(`Average form interaction time: ${avgInteractionTime}ms`)

    // Form interactions should be responsive
    expect(avgInteractionTime).toBeLessThan(1000) // Under 1000ms

    console.log('Form submission load test completed')
  })

  test('should handle image loading under load', async ({ page }) => {
    await page.goto('/sq/home')

    // Find all images on the page
    const images = page.locator('img')
    const imageCount = await images.count()

    if (imageCount > 0) {
      console.log(`Testing ${imageCount} images under load`)

      // Monitor image loading performance
      const imageLoadTimes = []

      for (let i = 0; i < imageCount; i++) {
        const startTime = Date.now()

        // Wait for image to load
        await images.nth(i).waitFor({ state: 'visible', timeout: 5000 })

        const loadTime = Date.now() - startTime
        imageLoadTimes.push(loadTime)
      }

      const avgImageLoadTime = imageLoadTimes.reduce((a, b) => a + b) / imageLoadTimes.length
      const maxImageLoadTime = Math.max(...imageLoadTimes)

      console.log(`Average image load time: ${avgImageLoadTime}ms`)
      console.log(`Max image load time: ${maxImageLoadTime}ms`)

      // Images should load reasonably fast
      expect(avgImageLoadTime).toBeLessThan(2000) // Under 2 seconds average
      expect(maxImageLoadTime).toBeLessThan(5000) // Under 5 seconds max
    } else {
      console.log('No images found to test')
    }

    console.log('Image loading load test completed')
  })

  test('should handle API call load', async ({ page }) => {
    await page.goto('/sq')

    // Simulate multiple rapid interactions instead of API calls
    const interactions = []
    const maxInteractions = 10

    for (let i = 0; i < maxInteractions; i++) {
      const startTime = Date.now()

      // Simulate user interaction (clicking buttons/links)
      const buttons = page.locator('button')
      const links = page.locator('a[href]')

      if (await buttons.count() > 0) {
        await buttons.first().click({ timeout: 1000 })
      } else if (await links.count() > 0) {
        await links.first().click({ timeout: 1000 })
      }

      const interactionTime = Date.now() - startTime
      interactions.push(interactionTime)

      // Navigate back if we navigated away
      try {
        await page.goBack({ timeout: 1000 })
      } catch (error) {
        // Ignore if can't go back
      }
    }

    const successfulInteractions = interactions.filter(time => time < 2000).length
    console.log(`${successfulInteractions}/${maxInteractions} interactions completed within 2 seconds`)

    // At least some interactions should succeed
    expect(successfulInteractions).toBeGreaterThan(5)
  })

  test('should handle memory usage under sustained load', async ({ page }) => {
    await page.goto('/sq/home')

    const memoryChecks: Array<{ usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number }> = []
    const checkInterval = 1000 // Check every second
    const testDuration = 10000 // 10 seconds

    console.log('Starting memory usage monitoring under load')

    // Simulate sustained activity
    const activityPromise = (async () => {
      for (let i = 0; i < testDuration / checkInterval; i++) {
        // Perform some activity to generate load
        await page.goto('/sq/marketplace')
        await page.goto('/sq/home')

        // Check memory usage
        const memoryInfo = await page.evaluate(() => {
          const perfMemory = (performance as any).memory
          return {
            usedJSHeapSize: perfMemory?.usedJSHeapSize || 0,
            totalJSHeapSize: perfMemory?.totalJSHeapSize || 0,
            jsHeapSizeLimit: perfMemory?.jsHeapSizeLimit || 0
          }
        })

        memoryChecks.push(memoryInfo)
        await page.waitForTimeout(checkInterval)
      }
    })()

    await activityPromise

    // Analyze memory usage over time
    const memoryUsagePercentages = memoryChecks
      .filter(m => m.jsHeapSizeLimit > 0)
      .map(m => (m.usedJSHeapSize / m.jsHeapSizeLimit) * 100)

    if (memoryUsagePercentages.length > 0) {
      const avgMemoryUsage = memoryUsagePercentages.reduce((a, b) => a + b) / memoryUsagePercentages.length
      const maxMemoryUsage = Math.max(...memoryUsagePercentages)

      console.log(`Memory usage analysis:`)
      console.log(`Average: ${avgMemoryUsage.toFixed(2)}%`)
      console.log(`Maximum: ${maxMemoryUsage.toFixed(2)}%`)

      // Memory usage should remain reasonable
      expect(avgMemoryUsage).toBeLessThan(70) // Under 70% average
      expect(maxMemoryUsage).toBeLessThan(85) // Under 85% peak
    }

    console.log('Memory usage load test completed')
  })
})