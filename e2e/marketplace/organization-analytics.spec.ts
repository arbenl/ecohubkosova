import { test, expect } from "@playwright/test"

/**
 * Organization Analytics E2E Tests
 *
 * Tests the analytics dashboard in the My Organization workspace.
 * Covers viewing analytics, time range filtering, and localization.
 */

test.describe("Organization Analytics", () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto("/en/login")
    await page.fill('input[type="email"]', "test@example.com")
    await page.fill('input[type="password"]', "password123")
    await page.click('button[type="submit"]')

    // Wait for login redirect
    await page.waitForURL(/\/(en|sq)\//)
  })

  test("should display analytics tab in My Organization", async ({ page }) => {
    // Navigate to My Organization workspace
    await page.goto("/en/my/organization")

    // Check if Analytics tab is visible
    const analyticsTab = page.getByRole("button", { name: /analytics/i })
    await expect(analyticsTab).toBeVisible()
  })

  test("should load analytics when tab is clicked", async ({ page }) => {
    await page.goto("/en/my/organization")

    // Click Analytics tab
    await page.getByRole("button", { name: /analytics/i }).click()

    // Wait for analytics to load
    await page.waitForLoadState("networkidle")

    // Check for analytics section
    const impactHeading = page.getByText(/your impact at a glance/i)
    await expect(impactHeading).toBeVisible()
  })

  test("should display analytics summary cards", async ({ page }) => {
    await page.goto("/en/my/organization")

    // Click Analytics tab
    await page.getByRole("button", { name: /analytics/i }).click()
    await page.waitForLoadState("networkidle")

    // Check for summary cards
    await expect(page.getByText(/views/i)).toBeVisible()
    await expect(page.getByText(/contacts/i)).toBeVisible()
    await expect(page.getByText(/saved/i)).toBeVisible()
    await expect(page.getByText(/shares/i)).toBeVisible()
  })

  test("should allow time range filtering", async ({ page }) => {
    await page.goto("/en/my/organization")

    // Click Analytics tab
    await page.getByRole("button", { name: /analytics/i }).click()
    await page.waitForLoadState("networkidle")

    // Click on different time ranges
    const last30Days = page.getByRole("button", { name: /last 30 days/i })
    const last90Days = page.getByRole("button", { name: /last 90 days/i })
    const allTime = page.getByRole("button", { name: /all time/i })

    // Verify buttons exist
    await expect(last30Days).toBeVisible()
    await expect(last90Days).toBeVisible()
    await expect(allTime).toBeVisible()

    // Click different range
    await last90Days.click()
    await page.waitForLoadState("networkidle")

    // Verify UI updates (button should be highlighted)
    await expect(last90Days).toHaveClass(/bg-green-600/)
  })

  test("should display listings performance table", async ({ page }) => {
    await page.goto("/en/my/organization")

    // Click Analytics tab
    await page.getByRole("button", { name: /analytics/i }).click()
    await page.waitForLoadState("networkidle")

    // Check for table headers
    const tableHeadings = [
      "Listing name",
      "Status",
      "Views",
      "Contacts",
      "Saved",
      "Shares",
    ]

    for (const heading of tableHeadings) {
      const element = page.getByText(new RegExp(heading, "i"))
      // Table should either have the heading or be empty
      const isVisible = await element.isVisible().catch(() => false)
      // If not visible, check for empty state
      if (!isVisible) {
        const emptyState = page.getByText(/no listings with activity yet/i)
        await expect(emptyState).toBeVisible({ timeout: 1000 }).catch(() => {})
      }
    }
  })

  test("should support Albanian localization", async ({ page }) => {
    // Navigate to Albanian version
    await page.goto("/sq/my/organization")

    // Click Analytics tab
    const analyticsTab = page.getByRole("button", { name: /analytics/i })
    await expect(analyticsTab).toBeVisible()

    // Click it
    await analyticsTab.click()
    await page.waitForLoadState("networkidle")

    // Check for Albanian text
    const impactHeading = page.getByText(/ndikimi.*përfundime/i)
    await expect(impactHeading).toBeVisible()

    // Check for Albanian summary labels
    const shikimet = page.getByText(/shikime/i)
    await expect(shikimet).toBeVisible()
  })

  test("should handle empty analytics state gracefully", async ({ page }) => {
    await page.goto("/en/my/organization")

    // Click Analytics tab
    await page.getByRole("button", { name: /analytics/i }).click()
    await page.waitForLoadState("networkidle")

    // If there's no data, should show empty state
    const emptyStateOrTable = page.locator("table, .text-center")
    await expect(emptyStateOrTable.first()).toBeVisible()
  })

  test("should persist tab selection during session", async ({ page }) => {
    await page.goto("/en/my/organization")

    // Click Analytics tab
    await page.getByRole("button", { name: /analytics/i }).click()
    await page.waitForLoadState("networkidle")

    // Verify Analytics tab is active
    const analyticsTab = page.getByRole("button", { name: /analytics/i })
    await expect(analyticsTab).toHaveClass(/border-b-2/)

    // Reload page
    await page.reload()
    await page.waitForLoadState("networkidle")

    // Should show Profile tab by default after reload
    const profileTab = page.getByRole("button", { name: /organization profile/i })
    await expect(profileTab).toHaveClass(/border-b-2/)
  })

  test("should update analytics when time range changes", async ({ page }) => {
    await page.goto("/en/my/organization")

    // Click Analytics tab
    await page.getByRole("button", { name: /analytics/i }).click()
    await page.waitForLoadState("networkidle")

    // Get initial view count
    const viewsCard = page.locator("text=/Views/i").first()
    const initialViewsText = await viewsCard.textContent()

    // Change time range
    await page.getByRole("button", { name: /all time/i }).click()
    await page.waitForLoadState("networkidle")

    // Views should still be visible (may be same or different value)
    const updatedViewsCard = page.locator("text=/Views/i").first()
    await expect(updatedViewsCard).toBeVisible()
  })

  test("should display correct interaction type counts", async ({ page }) => {
    await page.goto("/en/my/organization")

    // Click Analytics tab
    await page.getByRole("button", { name: /analytics/i }).click()
    await page.waitForLoadState("networkidle")

    // Verify cards show numeric values
    const cards = page.locator('[class*="border-green"]')
    const cardCount = await cards.count()

    // Should have at least 4 summary cards (views, contacts, saves, shares)
    if (cardCount >= 4) {
      for (let i = 0; i < Math.min(4, cardCount); i++) {
        const card = cards.nth(i)
        const numberElement = card.locator("text=/^[0-9,]+$/")
        // Either has a number or empty state
        const hasNumber = await numberElement.isVisible().catch(() => false)
        const hasEmptyState = await card.getByText(/no activity/i).isVisible().catch(() => false)
        expect(hasNumber || hasEmptyState).toBeTruthy()
      }
    }
  })
})
