import { test, expect } from "@playwright/test"

test.describe("Marketplace Smoke Tests", () => {
  test("should load marketplace page in Albanian", async ({ page }) => {
    await page.goto("/sq/marketplace")

    // Verify page loads
    await expect(page.locator("body")).toBeVisible()

    // Verify H2 hero title exists (actual implementation uses h2)
    await expect(page.locator("h2").first()).toBeVisible()
  })

  test("should load marketplace page in English", async ({ page }) => {
    await page.goto("/en/marketplace")

    // Verify URL stays on /en/
    await expect(page).toHaveURL(/\/en\/marketplace/)

    // Verify page loads
    await expect(page.locator("body")).toBeVisible()

    // Verify H2 hero title (actual hero in marketplace-client-page.tsx line 195)
    await expect(page.locator("h2").first()).toContainText("The Marketplace for Circular Economy")
  })

  test("should display search input", async ({ page }) => {
    await page.goto("/sq/marketplace")

    // Verify search input exists and is visible
    const searchInput = page.locator('input[name="search"]')
    await expect(searchInput).toBeVisible()

    // Verify placeholder contains search text (flexible matching)
    await expect(searchInput).toHaveAttribute("placeholder", /Kërko/)
  })

  test("should update filter state when clicked", async ({ page }) => {
    await page.goto("/sq/marketplace")

    // Click "Për Shitje" button (filterTypes.forSale)
    const forSaleBtn = page.getByRole("button", { name: "Për Shitje" })
    await forSaleBtn.click()

    // Verify button becomes active (default variant has bg-primary)
    await expect(forSaleBtn).toHaveClass(/bg-primary/)
  })
})
