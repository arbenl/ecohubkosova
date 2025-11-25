import { test, expect } from "@playwright/test"

test.describe("English Home Page (/en/home)", () => {
  test("should load English home page and display main content", async ({ page }) => {
    await page.goto("/en/home")

    // Verify page loads with correct title
    await expect(page).toHaveTitle("ECO HUB KOSOVA | Connect. Collaborate. Create Circulation.")

    // Check main elements exist
    await expect(page.locator("header")).toBeVisible()
    await expect(page.locator("body")).toBeVisible()

    console.log("English home page loaded successfully")
  })

  test("should display English navigation links", async ({ page }) => {
    await page.goto("/en/home")

    // Check if navigation links are present in English
    const header = page.locator("header")
    await expect(header).toBeVisible()

    // Verify English navigation text (actual header links from header-client.tsx)
    await expect(page.getByText("Marketplace")).toBeVisible()
    await expect(page.getByText("Partners")).toBeVisible()
    await expect(page.getByText("How it works")).toBeVisible()
    await expect(page.getByText("About")).toBeVisible()

    console.log("English navigation links verified")
  })

  test("should handle page responsiveness", async ({ page }) => {
    await page.goto("/en/home")

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator("body")).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator("body")).toBeVisible()

    console.log("Responsive design test completed for English page")
  })

  test("should load page within reasonable time", async ({ page }) => {
    const startTime = Date.now()

    await page.goto("/en/home", { waitUntil: "domcontentloaded" })

    const loadTime = Date.now() - startTime
    console.log(`English page loaded in ${loadTime}ms`)

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000)

    // Verify basic content loaded
    await expect(page.locator("body")).toBeVisible()
  })

  test("should handle browser back/forward navigation", async ({ page }) => {
    // Start at English home
    await page.goto("/en/home")
    await expect(page.locator("body")).toBeVisible()

    // Navigate to English marketplace
    await page.goto("/en/marketplace")
    await expect(page.locator("body")).toBeVisible()

    // Go back
    await page.goBack()
    await expect(page).toHaveURL(/\/en\/home/)

    // Go forward
    await page.goForward()
    await expect(page).toHaveURL(/\/en\/marketplace/)

    console.log("Browser navigation works correctly for English pages")
  })
})
