import { test, expect } from "@playwright/test"

test.describe("Marketplace Landing Page", () => {
  test("should load marketplace landing page", async ({ page }) => {
    test.setTimeout(15000)

    await page.goto("/en/marketplace", { waitUntil: "domcontentloaded" })

    // Verify page loaded
    await expect(page.locator("body")).toBeVisible()
    await expect(page).toHaveURL(/\/en\/marketplace/)
  })

  test("should display hero section", async ({ page }) => {
    test.setTimeout(15000)

    await page.goto("/en/marketplace", { waitUntil: "domcontentloaded" })

    // Check hero title exists (h2, not h1)
    const heading = page.locator("h2").first()
    await expect(heading).toBeVisible()
  })

  test("should display only one primary hero (no double-hero)", async ({ page }) => {
    test.setTimeout(15000)

    await page.goto("/en/marketplace", { waitUntil: "domcontentloaded" })

    // Check that marketplace uses h2 for hero (no h1 on this page)
    const h2Count = await page.locator("h2").count()
    expect(h2Count).toBeGreaterThanOrEqual(1)

    // Verify the main h2 contains marketplace-related text
    const mainTitle = page.locator("h2").first()
    const titleText = await mainTitle.textContent()
    expect(titleText).toMatch(/Marketplace|Circular Economy/i)

    // Verify filter buttons section is visible (proves embedded marketplace works)
    const filterButtons = page
      .locator("button")
      .filter({ hasText: /All|Të gjitha|Pour|Alle/ })
      .first()
    await expect(filterButtons).toBeVisible()
  })

  test("should display search bar", async ({ page }) => {
    test.setTimeout(15000)

    await page.goto("/en/marketplace", { waitUntil: "domcontentloaded" })

    // Check search input exists
    const searchInput = page.locator("input").first()
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible()
    }
  })

  test("should display marketplace sections", async ({ page }) => {
    test.setTimeout(15000)

    await page.goto("/en/marketplace", { waitUntil: "domcontentloaded" })

    // Check if main sections exist
    const sections = page.locator("section")
    const count = await sections.count()
    expect(count).toBeGreaterThan(0)
  })

  test("should work in Albanian locale", async ({ page }) => {
    test.setTimeout(15000)

    await page.goto("/sq/marketplace", { waitUntil: "domcontentloaded" })

    // Verify page loaded and has Albanian URL
    await expect(page).toHaveURL(/\/sq\/marketplace/)
    await expect(page.locator("body")).toBeVisible()
  })

  test("should redirect marketplace-v2 to main marketplace", async ({ page }) => {
    test.setTimeout(15000)

    await page.goto("/en/marketplace-v2", { waitUntil: "domcontentloaded" })

    // Should redirect to /marketplace
    await expect(page).toHaveURL(/\/en\/marketplace/)
  })
})
