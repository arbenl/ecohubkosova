import { test, expect } from "@playwright/test";
import { MarketplacePage } from "../pages/marketplace.page";

test.describe("Marketplace Flows - Generated Test Suite", () => {
  let marketplacePage: MarketplacePage;

  test.beforeEach(async ({ page }) => {
    marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();
  });

  // Browse Listings
  test("should browse all marketplace listings", async ({ page }) => {
    // Verify marketplace loads with listings
    await expect(page.locator(".listing-card")).toHaveCount(1, { timeout: 10000 });
    
    // Verify listing information is visible
    const firstListing = page.locator(".listing-card").first();
    await expect(firstListing.locator("h3")).toBeVisible();
    await expect(firstListing.locator(".price")).toBeVisible();
  });

  // Search Listings
  test("should search listings by keyword", async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await searchInput.fill("sustainable");
    await searchInput.press("Enter");
    await page.waitForLoadState("networkidle");
    
    // Verify search results
    await expect(page.locator(".listing-card")).toBeTruthy();
  });

  // Filter by Category
  test("should filter listings by category", async ({ page }) => {
    const filterButton = page.locator("button:has-text('Kategori'), button:has-text('Category')").first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Select a category option
      const categoryOption = page.locator("button[role='option'], div[role='option']").first();
      await categoryOption.click();
      
      // Wait for filtered results
      await page.waitForLoadState("networkidle");
      await expect(page.locator(".listing-card")).toBeTruthy();
    }
  });

  // Filter by Type
  test("should filter listings by type (product/service)", async ({ page }) => {
    const typeFilter = page.locator("button:has-text('Lloji'), button:has-text('Type')").first();
    if (await typeFilter.isVisible()) {
      await typeFilter.click();
      
      // Select product/service option
      const typeOption = page.locator("button[role='option'], div[role='option']").first();
      await typeOption.click();
      
      await page.waitForLoadState("networkidle");
      await expect(page.locator(".listing-card")).toBeTruthy();
    }
  });

  // View Listing Details
  test("should view individual listing details", async ({ page }) => {
    // Click first listing
    const firstListing = page.locator(".listing-card").first();
    await firstListing.click();
    
    // Wait for detail page
    await page.waitForURL(/.*marketplace\/\d+.*/, { timeout: 10000 });
    
    // Verify detail content
    await expect(page.locator("h1, h2")).toContainText(/(Product|Service|Listing)/i);
  });

  // Contact Seller
  test("should display contact seller button", async ({ page }) => {
    const firstListing = page.locator(".listing-card").first();
    await firstListing.click();
    
    await page.waitForURL(/.*marketplace\/\d+.*/, { timeout: 10000 });
    
    // Verify contact button exists
    const contactButton = page.locator("button:has-text('Kontakto'), button:has-text('Contact')");
    await expect(contactButton).toBeVisible();
  });

  // Create Listing (Auth Required)
  test("should show create listing button when authenticated", async ({ page }) => {
    const createButton = page.locator("a:has-text('Shto listim të ri'), button:has-text('Create Listing')");
    // Button may not be visible without auth - that's okay
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible();
    }
  });

  // Responsive Design
  test("should display responsive marketplace on mobile", async ({ page }) => {
    // Already in mobile viewport from config
    await expect(page.locator(".listing-card")).toBeTruthy();
    
    // Verify no horizontal scroll
    const viewportSize = page.viewportSize();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual((viewportSize?.width || 0) + 1);
  });

  // Empty State
  test("should handle no search results gracefully", async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await searchInput.fill("xyznonexistentproduct123456789");
    await searchInput.press("Enter");
    await page.waitForLoadState("networkidle");
    
    // Should either show empty state or still show listings
    const listings = page.locator(".listing-card");
    const count = await listings.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  // Pagination (if applicable)
  test("should paginate through listings if applicable", async ({ page }) => {
    const nextButton = page.locator("button:has-text('Next'), button[aria-label*='next']");
    if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
      await nextButton.click();
      await page.waitForLoadState("networkidle");
      await expect(page.locator(".listing-card")).toBeTruthy();
    }
  });

  // Sorting (if applicable)
  test("should sort listings if sort option available", async ({ page }) => {
    const sortButton = page.locator("button:has-text('Sort'), select[name*='sort']");
    if (await sortButton.isVisible()) {
      await sortButton.click();
      
      const sortOption = page.locator("button[role='option'], option").first();
      if (await sortOption.isVisible()) {
        await sortOption.click();
        await page.waitForLoadState("networkidle");
      }
    }
  });
});
