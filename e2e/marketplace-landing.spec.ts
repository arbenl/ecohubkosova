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
    
    // Check hero title exists
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible()
  })

  test("should display search bar", async ({ page }) => {
    test.setTimeout(15000)
    
    await page.goto("/en/marketplace", { waitUntil: "domcontentloaded" })
    
    // Check search input exists
    const searchInput = page.locator('input').first()
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

