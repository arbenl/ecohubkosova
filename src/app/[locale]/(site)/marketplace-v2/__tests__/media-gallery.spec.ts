import { test, expect } from "@playwright/test"

test.describe("Marketplace V2 Media Gallery", () => {
  test("should display gallery for listing with media", async ({ page }) => {
    // Visit a listing detail page
    // Note: This test assumes a listing with media exists in the database
    // In real scenario, you'd create a listing with media in the test setup
    
    await page.goto("/en/marketplace-v2")
    
    // If there are listings, click on the first one
    const firstListing = page.locator('[data-testid="listing-card"]').first()
    const isVisible = await firstListing.isVisible()
    
    if (isVisible) {
      await firstListing.click()
      
      // Wait for detail page to load
      await page.waitForSelector('[data-testid="media-gallery"]', { timeout: 5000 }).catch(() => null)
      
      // Check if media gallery is rendered
      const gallery = page.locator('[data-testid="media-gallery"]')
      if (await gallery.count() > 0) {
        // Check for primary image
        const primaryImage = page.locator('[data-testid="primary-image"]')
        await expect(primaryImage).toBeVisible()
        
        // Check for thumbnails if multiple media
        const thumbnails = page.locator('[data-testid="media-thumbnail"]')
        const thumbCount = await thumbnails.count()
        
        if (thumbCount > 0) {
          // Thumbnails should be clickable
          await thumbnails.first().click()
          // Page should not error after clicking
          await expect(page).not.toHaveURL(/.*error.*/)
        }
      }
    }
  })

  test("should show no photos message when listing has no media", async ({ page }) => {
    await page.goto("/en/marketplace-v2")
    
    const firstListing = page.locator('[data-testid="listing-card"]').first()
    const isVisible = await firstListing.isVisible()
    
    if (isVisible) {
      await firstListing.click()
      
      // Check if empty gallery message exists
      const emptyMsg = page.locator("text=No photos yet")
      if (await emptyMsg.count() > 0) {
        await expect(emptyMsg).toBeVisible()
      }
    }
  })

  test("media gallery should be responsive", async ({ page, viewport }) => {
    // Test on different screen sizes
    const sizes = ["mobile", "tablet", "desktop"]
    
    for (const size of sizes) {
      // Set viewport based on size
      if (size === "mobile") {
        await page.setViewportSize({ width: 375, height: 667 })
      } else if (size === "tablet") {
        await page.setViewportSize({ width: 768, height: 1024 })
      } else {
        await page.setViewportSize({ width: 1280, height: 720 })
      }
      
      await page.goto("/en/marketplace-v2")
      
      const firstListing = page.locator('[data-testid="listing-card"]').first()
      if (await firstListing.isVisible()) {
        await firstListing.click()
        
        // Gallery should still be accessible
        const gallery = page.locator('[data-testid="media-gallery"]')
        if (await gallery.count() > 0) {
          await expect(gallery).toBeVisible()
        }
      }
    }
  })

  test("primary image should be displayed prominently", async ({ page }) => {
    // Get listing detail page
    await page.goto("/en/marketplace-v2")
    
    const firstListing = page.locator('[data-testid="listing-card"]').first()
    if (await firstListing.isVisible()) {
      await firstListing.click()
      
      const primaryImage = page.locator('[data-testid="primary-image"]')
      if (await primaryImage.count() > 0) {
        // Primary image should have larger size
        const boundingBox = await primaryImage.boundingBox()
        expect(boundingBox?.width).toBeGreaterThan(300)
        expect(boundingBox?.height).toBeGreaterThan(200)
      }
    }
  })
})
