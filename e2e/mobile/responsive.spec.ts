import { test, expect } from '@playwright/test'

test.describe('Mobile Testing', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size

    await page.goto('/sq/home')

    // Check that page loads and is usable on mobile
    await expect(page).toHaveTitle('ECO HUB KOSOVA | Lidhu. Bashkëpuno. Krijo Qarkullim.')
    await expect(page.locator('body')).toBeVisible()

    // Check for mobile-specific elements
    const mobileMenuButton = page.locator('button[aria-label="Toggle menu"], .mobile-menu, .hamburger')
    const hasMobileMenu = await mobileMenuButton.count() > 0

    console.log(`Mobile viewport test: ${hasMobileMenu ? 'Mobile menu detected' : 'No mobile menu found'}`)

    // On mobile, should either have a mobile menu or responsive layout
    const headerVisible = await page.locator('header').isVisible()
    expect(headerVisible).toBe(true)

    console.log('Mobile viewport test completed')
  })

  test('should handle touch interactions', async ({ browser }) => {
    // Create a new context with touch enabled
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      hasTouch: true
    })
    const page = await context.newPage()

    await page.goto('/sq')

    // Test touch interactions on mobile
    const mainHeading = page.locator('h1').first()
    await expect(mainHeading).toBeVisible()

    // Test touch tap on heading
    const headingBox = await mainHeading.boundingBox()
    if (headingBox) {
      await page.touchscreen.tap(headingBox.x + 10, headingBox.y + 10)
    }

    // Test mobile navigation
    const mobileMenuButton = page.locator('button').filter({ hasText: 'Toggle menu' }).first()
    if (await mobileMenuButton.isVisible()) {
      const buttonBox = await mobileMenuButton.boundingBox()
      if (buttonBox) {
        await page.touchscreen.tap(buttonBox.x + 5, buttonBox.y + 5)
      }
    }

    await context.close()
  })

  test('should have responsive design across breakpoints', async ({ page }) => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 }
    ]

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })

      await page.goto('/sq/home')
      await page.waitForLoadState('networkidle')

      // Check that content is visible and properly laid out
      const bodyVisible = await page.locator('body').isVisible()
      const headerVisible = await page.locator('header').isVisible()

      console.log(`${breakpoint.name} (${breakpoint.width}x${breakpoint.height}): Body visible=${bodyVisible}, Header visible=${headerVisible}`)

      expect(bodyVisible).toBe(true)
      expect(headerVisible).toBe(true)

      // Check for layout issues (elements not overflowing)
      const overflowingElements = await page.$$eval('*', elements => {
        return elements.filter(el => {
          const rect = el.getBoundingClientRect()
          const style = window.getComputedStyle(el)
          return rect.right > window.innerWidth &&
                 style.position !== 'absolute' &&
                 style.position !== 'fixed'
        }).length
      })

      console.log(`${breakpoint.name}: ${overflowingElements} overflowing elements`)

      // Should have minimal overflow issues
      expect(overflowingElements).toBeLessThan(5)

      // Take screenshot for visual verification
      await page.screenshot({
        path: `test-results/responsive-${breakpoint.name}.png`,
        fullPage: true
      })
    }

    console.log('Responsive design test completed')
  })

  test('should handle mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/sq/home')

    // Look for mobile navigation elements
    const mobileMenuButton = page.locator('button[aria-label*="menu"], .mobile-menu-toggle, .hamburger')
    const hasMobileMenu = await mobileMenuButton.count() > 0

    if (hasMobileMenu) {
      console.log('Mobile menu detected, testing navigation')

      // Test opening mobile menu
      await mobileMenuButton.click()

      // Wait for menu to open
      await page.waitForTimeout(500)

      // Check if navigation links are visible
      const navLinks = page.locator('nav a, .mobile-menu a')
      const visibleLinks = await navLinks.count()

      console.log(`Mobile menu opened with ${visibleLinks} navigation links`)

      // Should have navigation links
      expect(visibleLinks).toBeGreaterThan(0)

      // Test closing menu (if there's a close button)
      const closeButton = page.locator('button[aria-label*="close"], .close-menu')
      if (await closeButton.count() > 0) {
        await closeButton.click()
        await page.waitForTimeout(500)
        console.log('Mobile menu closed successfully')
      }
    } else {
      console.log('No mobile menu found, testing responsive navigation')

      // Test that navigation is accessible without mobile menu
      const navLinks = page.locator('nav a')
      const visibleLinks = await navLinks.count()

      expect(visibleLinks).toBeGreaterThan(0)
      console.log(`Responsive navigation has ${visibleLinks} links`)
    }

    console.log('Mobile navigation test completed')
  })

  test('should handle mobile form inputs', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/sq/login')

    // Test mobile keyboard and input handling
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')

    if (await emailInput.count() > 0) {
      // Test email input
      await emailInput.fill('test@example.com')
      const emailValue = await emailInput.inputValue()
      expect(emailValue).toBe('test@example.com')

      console.log('Mobile email input working')
    }

    if (await passwordInput.count() > 0) {
      // Test password input
      await passwordInput.fill('password123')
      const passwordValue = await passwordInput.inputValue()
      expect(passwordValue).toBe('password123')

      console.log('Mobile password input working')
    }

    // Test virtual keyboard doesn't break layout
    const viewportHeight = await page.evaluate(() => window.innerHeight)
    console.log(`Viewport height: ${viewportHeight}px`)

    // Focus on input to potentially trigger virtual keyboard
    if (await emailInput.count() > 0) {
      await emailInput.focus()
      await page.waitForTimeout(500)

      // Check that content is still accessible
      const submitButton = page.locator('button[type="submit"]')
      if (await submitButton.count() > 0) {
        const isVisible = await submitButton.isVisible()
        expect(isVisible).toBe(true)
      }
    }

    console.log('Mobile form input test completed')
  })

  test('should handle mobile gestures', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/sq/home')

    // Test swipe gestures (if content supports it)
    const hasSwipeableContent = await page.locator('.carousel, .slider, [data-swipe]').count() > 0

    if (hasSwipeableContent) {
      console.log('Swipeable content detected, testing gestures')

      // Simulate swipe gesture
      await page.touchscreen.tap(300, 200)
      // Swipe left using touch
      await page.touchscreen.tap(300, 200)
      await page.mouse.move(300, 200)
      await page.mouse.down()
      await page.mouse.move(100, 200, { steps: 10 })
      await page.mouse.up()

      console.log('Swipe gesture simulated')
    } else {
      console.log('No swipeable content found')
    }

    // Test pinch-to-zoom (if supported)
    try {
      // This might not work in all browsers, so wrap in try-catch
      await page.evaluate(() => {
        // Simulate pinch gesture (basic implementation)
        const touch1 = new Touch({
          identifier: 1,
          target: document.body,
          clientX: 150,
          clientY: 200
        })
        const touch2 = new Touch({
          identifier: 2,
          target: document.body,
          clientX: 250,
          clientY: 200
        })

        const touchStart = new TouchEvent('touchstart', {
          touches: [touch1, touch2]
        })

        document.body.dispatchEvent(touchStart)
      })

      console.log('Pinch gesture simulation attempted')
    } catch (error) {
      console.log('Pinch gesture not supported in this environment')
    }

    console.log('Mobile gestures test completed')
  })

  test('should handle mobile network conditions', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Simulate slow mobile network
    await context.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    })

    // Throttle network to simulate mobile conditions
    await page.route('**/*', async (route) => {
      // Add delay to simulate slow mobile network
      await new Promise(resolve => setTimeout(resolve, 100))
      await route.continue()
    })

    const startTime = Date.now()
    await page.goto('/sq/home')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    console.log(`Mobile network load time: ${loadTime}ms`)

    // Should still load within reasonable time even on slow network
    expect(loadTime).toBeLessThan(10000) // Under 10 seconds

    // Content should still be functional
    const bodyVisible = await page.locator('body').isVisible()
    expect(bodyVisible).toBe(true)

    console.log('Mobile network conditions test completed')
  })

  test('should handle device orientation changes', async ({ page }) => {
    // Start in portrait mode
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/sq/home')

    console.log('Testing portrait orientation')
    let bodyVisible = await page.locator('body').isVisible()
    expect(bodyVisible).toBe(true)

    // Simulate landscape orientation
    await page.setViewportSize({ width: 667, height: 375 })

    console.log('Testing landscape orientation')
    bodyVisible = await page.locator('body').isVisible()
    expect(bodyVisible).toBe(true)

    // Check that layout adapts to orientation change
    const headerVisible = await page.locator('header').isVisible()
    expect(headerVisible).toBe(true)

    // Test that interactive elements are still accessible
    const buttons = page.locator('button')
    if (await buttons.count() > 0) {
      const firstButtonVisible = await buttons.first().isVisible()
      expect(firstButtonVisible).toBe(true)
    }

    console.log('Device orientation changes test completed')
  })
})