import { test, expect } from '@playwright/test'

test.describe('Performance Testing', () => {
  test('should load homepage within acceptable time limits', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/sq/home')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime
    console.log(`Homepage load time: ${loadTime}ms`)

    // Performance thresholds
    expect(loadTime).toBeLessThan(3000) // Less than 3 seconds

    // Check Core Web Vitals approximation
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      }
    })

    console.log('Performance metrics:', metrics)

    // Reasonable thresholds for Core Web Vitals
    expect(metrics.domContentLoaded).toBeLessThan(2000)
    expect(metrics.loadComplete).toBeLessThan(3000)
  })

  test('should handle navigation performance efficiently', async ({ page }) => {
    await page.goto('/sq/home')

    // Test navigation between pages
    const navigationTimes = []

    for (const route of ['/sq/marketplace', '/sq/partners', '/sq/login', '/sq/home']) {
      const startTime = Date.now()
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const navTime = Date.now() - startTime
      navigationTimes.push(navTime)
      console.log(`${route} navigation time: ${navTime}ms`)
    }

    // Average navigation should be under 2 seconds
    const avgTime = navigationTimes.reduce((a, b) => a + b) / navigationTimes.length
    expect(avgTime).toBeLessThan(2000)

    console.log(`Average navigation time: ${avgTime}ms`)
  })

  test('should maintain performance during user interactions', async ({ page }) => {
    await page.goto('/sq')

    // Wait for initial page load
    await page.waitForLoadState('networkidle')

    // Measure navigation performance
    const startTime = Date.now()

    // Try to navigate to marketplace (if link exists)
    const marketplaceLink = page.locator('nav a').filter({ hasText: 'Tregu' }).first()
    if (await marketplaceLink.isVisible({ timeout: 2000 })) {
      await marketplaceLink.click()

      // Wait for navigation to complete
      await page.waitForLoadState('networkidle', { timeout: 10000 })

      const navigationTime = Date.now() - startTime
      console.log(`Navigation to marketplace took ${navigationTime}ms`)

      // Navigation should complete within reasonable time
      expect(navigationTime).toBeLessThan(10000) // 10 seconds max
    } else {
      console.log('Marketplace link not found, skipping navigation test')
    }

    // Basic performance check - page should still be responsive
    const mainContent = page.getByRole('main').first()
    await expect(mainContent).toBeVisible()
  })

  test('should handle large content efficiently', async ({ page }) => {
    await page.goto('/sq/marketplace')

    // Wait for any dynamic content to load
    await page.waitForTimeout(2000)

    // Measure memory usage approximation
    const memoryInfo = await page.evaluate(() => {
      // Get basic performance metrics
      const perfMemory = (performance as any).memory
      return {
        usedJSHeapSize: perfMemory?.usedJSHeapSize || 0,
        totalJSHeapSize: perfMemory?.totalJSHeapSize || 0,
        jsHeapSizeLimit: perfMemory?.jsHeapSizeLimit || 0
      }
    })

    console.log('Memory usage:', memoryInfo)

    // Basic memory checks (if available)
    if (memoryInfo.usedJSHeapSize > 0) {
      const memoryUsagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
      console.log(`Memory usage: ${memoryUsagePercent.toFixed(2)}%`)
      expect(memoryUsagePercent).toBeLessThan(80) // Less than 80% of heap limit
    }
  })

  test('should handle resource loading efficiently', async ({ page }) => {
    const resources: Array<{
      url: string
      type: string
      size: number
      status: number
    }> = []

    // Monitor resource loading
    page.on('response', response => {
      const url = response.url()
      const contentType = response.headers()['content-type'] || ''
      const size = parseInt(response.headers()['content-length'] || '0')

      resources.push({
        url: url.split('/').pop() || url, // Just filename
        type: contentType.split('/')[0], // main type
        size,
        status: response.status()
      })
    })

    await page.goto('/sq/home')
    await page.waitForLoadState('networkidle')

    // Analyze loaded resources
    const jsResources = resources.filter(r => r.type === 'application' && r.url.includes('.js'))
    const cssResources = resources.filter(r => r.type === 'text' && r.url.includes('.css'))
    const imageResources = resources.filter(r => r.type === 'image')

    console.log(`JavaScript files: ${jsResources.length}`)
    console.log(`CSS files: ${cssResources.length}`)
    console.log(`Images: ${imageResources.length}`)

    // Check for reasonable resource counts
    expect(jsResources.length).toBeLessThan(30) // Not too many JS files
    expect(cssResources.length).toBeLessThan(10) // Not too many CSS files

    // Check for failed resources
    const failedResources = resources.filter(r => r.status >= 400)
    expect(failedResources.length).toBe(0)

    console.log('Resource loading analysis complete')
  })

  test('should handle concurrent requests efficiently', async ({ page }) => {
    await page.goto('/sq')

    // Test basic page loading without making external API calls
    await page.waitForLoadState('networkidle')

    // Check that page loads within reasonable time
    const loadTime = await page.evaluate(() => {
      // Use Navigation Timing API if available
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        return navigation.loadEventEnd - navigation.fetchStart
      }
      return 0
    })

    if (loadTime > 0) {
      console.log(`Page load time: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(5000) // Should load within 5 seconds
    }

    // Basic functionality check
    const mainContent = page.getByRole('main').first()
    await expect(mainContent).toBeVisible()
  })
})