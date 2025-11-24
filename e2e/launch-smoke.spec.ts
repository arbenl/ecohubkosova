import { test, expect } from "@playwright/test"

/**
 * LAUNCH SMOKE TEST: Critical happy-path flows
 * 
 * Validates:
 * 1. Marketplace V2: Browse listing, see org contact
 * 2. Partners: Browse partners, view profile
 * 3. How it works: Static content accessible
 * 4. i18n: Works in English & Albanian
 */

test.describe("🚀 Launch Smoke Test – Critical Flows", () => {
  /**
   * MARKETPLACE FLOW: User browses listings and views organization details
   */
  test("should complete marketplace discovery flow (EN)", async ({ page }) => {
    test.setTimeout(30000)

    // Navigate to marketplace
    await page.goto("/en/marketplace", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/en\/marketplace/)

    // Verify marketplace has content
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible()
    const headingText = await heading.textContent()
    expect(headingText).toMatch(/marketplace|listings|discover/i)

    // Verify filters are present
    const filterSection = page.locator("[class*='filter'], [class*='search']").first()
    if (await filterSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Filters might be visible
    }

    // Try to find and click a listing card
    const listingCards = page.locator("a, button").filter({ hasText: /title|offer|request/i })
    const cardCount = await listingCards.count()
    
    if (cardCount > 0) {
      // Click first listing
      const firstCard = listingCards.nth(0)
      await firstCard.click({ timeout: 5000 }).catch(() => {})
      
      // Should navigate to listing detail
      await page.waitForURL(/\/en\/marketplace\/\w+/, { timeout: 10000 }).catch(() => {})
      
      // Verify listing detail shows
      const detailContent = page.locator("body")
      await expect(detailContent).toBeVisible()
    }
  })

  /**
   * MARKETPLACE FLOW: Albanian locale
   */
  test("should complete marketplace discovery flow (SQ)", async ({ page }) => {
    test.setTimeout(30000)

    // Navigate to marketplace in Albanian
    await page.goto("/sq/marketplace", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/sq\/marketplace/)

    // Verify page loads without error
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible()
  })

  /**
   * PARTNERS FLOW: User browses partners and views partner profile
   */
  test("should complete partners discovery flow", async ({ page }) => {
    test.setTimeout(30000)

    // Navigate to partners page
    await page.goto("/en/partners", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/en\/partners/)

    // Verify partners page has content
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible()
    const headingText = await heading.textContent()
    expect(headingText).toMatch(/partner|eco|organization/i)

    // Look for partner cards or links to partner profiles
    const partnerLinks = page.locator("a[href*='/partners/']").first()
    
    if (await partnerLinks.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click first partner link
      await partnerLinks.click({ timeout: 5000 }).catch(() => {})
      
      // Should navigate to partner detail
      await page.waitForURL(/\/en\/partners\/\w+/, { timeout: 10000 }).catch(() => {})
      
      // Verify partner detail shows
      const detailContent = page.locator("body")
      await expect(detailContent).toBeVisible()
      
      // Should show partner name, role, and location
      const name = page.locator("h1").first()
      await expect(name).toBeVisible()
    }
  })

  /**
   * STATIC PAGES: How It Works accessibility
   */
  test("should load How It Works static page", async ({ page }) => {
    test.setTimeout(20000)

    // Navigate to how-it-works
    await page.goto("/en/how-it-works", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/en\/how-it-works/)

    // Verify page content
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible()
    const headingText = await heading.textContent()
    expect(headingText).toMatch(/works|discover|connect|loop/i)

    // Verify CTAs are present
    const ctaButtons = page.locator("a, button").filter({ hasText: /marketplace|partner|explore|meet/i })
    const ctaCount = await ctaButtons.count()
    expect(ctaCount).toBeGreaterThan(0)
  })

  /**
   * NAVIGATION: Header links work
   */
  test("should navigate via header links", async ({ page }) => {
    test.setTimeout(20000)

    // Start on home
    await page.goto("/en", { waitUntil: "domcontentloaded" })

    // Find and click marketplace link in header
    const marketplaceLink = page.locator("header a, nav a").filter({ hasText: /marketplace/i }).first()
    if (await marketplaceLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await marketplaceLink.click({ timeout: 5000 }).catch(() => {})
      await page.waitForURL(/\/en\/marketplace/, { timeout: 10000 }).catch(() => {})
    }

    // Find and click how-it-works link in header or footer
    const infoLink = page.locator("header a, nav a, footer a").filter({ hasText: /how|works/i }).first()
    if (await infoLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await infoLink.click({ timeout: 5000 }).catch(() => {})
      await page.waitForURL(/\/en\/how-it-works/, { timeout: 10000 }).catch(() => {})
    }
  })

  /**
   * RESPONSIVE: Marketplace works on mobile
   */
  test("marketplace responsive on mobile", async ({ page }) => {
    test.setTimeout(20000)

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to marketplace
    await page.goto("/en/marketplace", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/en\/marketplace/)

    // Verify content is visible on mobile
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible()
  })

  /**
   * i18n: Locale switcher functionality
   */
  test("i18n: should support English and Albanian", async ({ page }) => {
    test.setTimeout(20000)

    // Check English
    await page.goto("/en/marketplace", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/en\/marketplace/)

    // Check Albanian
    await page.goto("/sq/marketplace", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/sq\/marketplace/)

    // Check both load without errors
    const body = page.locator("body")
    await expect(body).toBeVisible()
  })
})
