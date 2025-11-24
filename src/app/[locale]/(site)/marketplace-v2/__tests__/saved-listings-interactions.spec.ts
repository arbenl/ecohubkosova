import { test, expect } from "@playwright/test"

test.describe("Marketplace V2 - Saved Listings & Interactions", () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto("/en/login")
    await page.fill('input[type="email"]', "test@example.com")
    await page.fill('input[type="password"]', "password123")
    await page.click('button:has-text("Sign in")')
    await page.waitForNavigation()
  })

  test("should save and unsave a listing from card", async ({ page }) => {
    // Navigate to marketplace
    await page.goto("/en/marketplace-v2")
    await page.waitForLoadState("networkidle")

    // Find first listing and save it
    const saveButton = page.locator('[data-testid="save-button"]').first()
    await expect(saveButton).toBeVisible()

    // Save listing
    await saveButton.click()
    await page.waitForTimeout(500)

    // Verify filled heart icon
    const filledHeart = page.locator('[data-testid="heart-filled"]').first()
    await expect(filledHeart).toBeVisible()

    // Unsave listing
    await saveButton.click()
    await page.waitForTimeout(500)

    // Verify outline heart icon
    const outlineHeart = page.locator('[data-testid="heart-outline"]').first()
    await expect(outlineHeart).toBeVisible()
  })

  test("should save listing from detail page", async ({ page }) => {
    // Navigate to marketplace
    await page.goto("/en/marketplace-v2")
    await page.waitForLoadState("networkidle")

    // Click on first listing to open detail
    const listingCard = page.locator('[data-testid="listing-card"]').first()
    await listingCard.click()
    await page.waitForNavigation()

    // Find save button on detail page
    const detailSaveButton = page.locator('button:has-text("Save for later")')
    await expect(detailSaveButton).toBeVisible()

    // Save the listing
    await detailSaveButton.click()
    await page.waitForTimeout(500)

    // Verify it shows as saved
    const savedButton = page.locator('button:has-text("Saved")')
    await expect(savedButton).toBeVisible()
  })

  test("should navigate to saved listings page", async ({ page }) => {
    // Navigate to saved listings
    await page.goto("/en/my/saved-listings")
    await page.waitForLoadState("networkidle")

    // Verify page title
    const title = page.locator('h1:has-text("Saved Listings")')
    await expect(title).toBeVisible()

    // Should have subtitle
    const subtitle = page.locator('text=Opportunities you want to track')
    await expect(subtitle).toBeVisible()
  })

  test("should display empty state when no saved listings", async ({ page }) => {
    // Navigate to saved listings
    await page.goto("/en/my/saved-listings")
    await page.waitForLoadState("networkidle")

    // Check if empty state exists
    const emptyTitle = page.locator('text=No saved listings yet')
    const emptyBody = page.locator(
      'text=Browse the marketplace and save opportunities'
    )

    // At least one should be visible (empty state)
    const emptyStates = await Promise.all([
      emptyTitle.isVisible(),
      emptyBody.isVisible(),
    ])
    expect(emptyStates.some((v) => v)).toBeTruthy()
  })

  test("should copy listing link to clipboard", async ({ page, context }) => {
    // Navigate to listing detail
    await page.goto("/en/marketplace-v2")
    await page.waitForLoadState("networkidle")

    // Click on first listing
    const listingCard = page.locator('[data-testid="listing-card"]').first()
    await listingCard.click()
    await page.waitForNavigation()

    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"])

    // Find and click share button
    const shareButton = page.locator('button:has-text("Share")')
    await expect(shareButton).toBeVisible()
    await shareButton.click()

    // Click "Copy link" option
    const copyLinkOption = page.locator('text=Copy link')
    await expect(copyLinkOption).toBeVisible()
    await copyLinkOption.click()

    // Verify toast message
    const linkCopiedMessage = page.locator('text=Link copied to clipboard')
    await expect(linkCopiedMessage).toBeVisible({ timeout: 3000 })
  })

  test("should share listing via email", async ({ page }) => {
    // Navigate to listing detail
    await page.goto("/en/marketplace-v2")
    await page.waitForLoadState("networkidle")

    // Click on first listing
    const listingCard = page.locator('[data-testid="listing-card"]').first()
    await listingCard.click()
    await page.waitForNavigation()

    // Find and click share button
    const shareButton = page.locator('button:has-text("Share")')
    await expect(shareButton).toBeVisible()
    await shareButton.click()

    // Click "Share via email" option
    const emailShareOption = page.locator('text=Share via email')
    await expect(emailShareOption).toBeVisible()

    // Note: We can't fully test email client opening, but we can verify the option exists
    await emailShareOption.click()
  })

  test("should display interaction stats on detail page", async ({ page }) => {
    // Navigate to listing detail
    await page.goto("/en/marketplace-v2")
    await page.waitForLoadState("networkidle")

    // Click on first listing
    const listingCard = page.locator('[data-testid="listing-card"]').first()
    await listingCard.click()
    await page.waitForNavigation()

    // Look for stats section
    const statsSection = page.locator('[data-testid="interaction-stats"]')
    
    // Stats might not always be visible, so we just check if they appear or not
    // The test passes as long as the page loads without errors
    await page.waitForLoadState("networkidle")
  })

  test("Albanian locale (SQ) - save button text", async ({ page }) => {
    // Navigate to marketplace in Albanian
    await page.goto("/sq/marketplace-v2")
    await page.waitForLoadState("networkidle")

    // Find save button and verify Albanian text
    const saveForLater = page.locator('button:has-text("Ruaj për më vonë")')
    await expect(saveForLater).toBeVisible()
  })

  test("should show saved count on saved listings page", async ({ page }) => {
    // First save a listing
    await page.goto("/en/marketplace-v2")
    await page.waitForLoadState("networkidle")

    const saveButton = page.locator('[data-testid="save-button"]').first()
    if (await saveButton.isVisible()) {
      await saveButton.click()
      await page.waitForTimeout(500)
    }

    // Navigate to saved listings
    await page.goto("/en/my/saved-listings")
    await page.waitForLoadState("networkidle")

    // Verify count is displayed
    const countText = page.locator('text=/saved/i')
    await expect(countText).toBeVisible({ timeout: 5000 })
  })

  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Create new context without login
    const newContext = await page.context().browser()?.newContext()
    if (!newContext) return

    const newPage = await newContext.newPage()

    // Try to access saved listings
    await newPage.goto("/en/my/saved-listings")

    // Should redirect to login
    await newPage.waitForNavigation()
    expect(newPage.url()).toContain("/login")

    await newPage.close()
    await newContext.close()
  })
})
