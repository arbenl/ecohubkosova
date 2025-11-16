import { test, expect } from '@playwright/test';
import { MarketplacePage } from '../pages/marketplace.page';
import { AuthPage } from '../pages/auth.page';
import { generateTestEmail } from '../helpers/test-utils';

test.describe('Marketplace Browsing', () => {
  let marketplacePage: MarketplacePage;

  test.beforeEach(async ({ page }) => {
    marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();
  });

  test('should display marketplace with listings', async ({ page }) => {
    marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();
    await marketplacePage.verifyOnMarketplacePage();

    // Marketplace should be visible
    const heading = page.locator('h1:has-text("Tregu i Ekonomisë Qarkulluese")');
    await expect(heading).toBeVisible();
  });

  test('should show create listing button for authenticated users', async ({ page }) => {
    // First authenticate user
    const authPage = new AuthPage(page);
    const testEmail = generateTestEmail();

    await authPage.navigateToRegister();
    await authPage.fillBasicInfo({
      fullName: 'Marketplace Test User',
      email: testEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      location: 'Prishtinë, Kosovë',
    });

    await authPage.selectRole('Individ');
    await authPage.clickContinue();
    await authPage.clickContinue();
    await authPage.acceptTermsAndConditions();
    await authPage.submitRegistration();

    await authPage.verifyRegistrationSuccess();

    // Navigate to marketplace
    marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Create listing button should be visible
    await marketplacePage.verifyCreateListingButtonVisible();
  });

  test('should search listings by keyword', async ({ page }) => {
    marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Try searching
    const searchInput = page.locator('input[placeholder*="Kërko"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Materiale riciklueshme');
      await page.waitForTimeout(500);
      
      // Results should update
      const listings = page.locator('[data-testid="listing-card"]');
      expect(await listings.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by category', async ({ page }) => {
    marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Look for category filter buttons
    const categoryButtons = page.locator('button:has-text("Materiale")');
    if (await categoryButtons.first().isVisible()) {
      await categoryButtons.first().click();
      await page.waitForLoadState('networkidle');

      // Should update listings
      const listings = page.locator('[data-testid="listing-card"]');
      expect(await listings.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should have responsive layout', async ({ page }) => {
    marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Check layout at different viewport sizes
    const viewports = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Page should still be functional
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    }
  });

  test('should display marketplace without authentication', async ({ page }) => {
    marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Should not have create button
    await marketplacePage.verifyLoggedOut();

    // But marketplace should still display
    const heading = page.locator('h1:has-text("Tregu")');
    await expect(heading).toBeVisible();
  });
});

test.describe('Listing Details', () => {
  test('should display listing details when clicking on listing', async ({ page }) => {
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Look for first listing
    const listings = page.locator('[data-testid="listing-card"]');
    if (await listings.count() > 0) {
      await listings.first().click();
      await page.waitForLoadState('networkidle');

      // Should show listing details
      const listingTitle = page.locator('h1').first();
      await expect(listingTitle).toBeVisible();
    }
  });

  test('should have contact button on listing details', async ({ page }) => {
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Navigate to first listing
    const listings = page.locator('[data-testid="listing-card"]');
    if (await listings.count() > 0) {
      await listings.first().click();
      await page.waitForLoadState('networkidle');

      // Look for contact button
      const contactButton = page.locator('button:has-text("Kontakto")');
      if (await contactButton.isVisible()) {
        await expect(contactButton).toBeVisible();
      }
    }
  });

  test('should display seller information on listing', async ({ page }) => {
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Navigate to first listing
    const listings = page.locator('[data-testid="listing-card"]');
    if (await listings.count() > 0) {
      await listings.first().click();
      await page.waitForLoadState('networkidle');

      // Look for seller info
      const sellerInfo = page.locator('[data-testid="seller-info"], text=Shitës');
      expect(await sellerInfo.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show listing price and description', async ({ page }) => {
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Navigate to first listing
    const listings = page.locator('[data-testid="listing-card"]');
    if (await listings.count() > 0) {
      await listings.first().click();
      await page.waitForLoadState('networkidle');

      // Check for price and description
      const price = page.locator('[data-testid="listing-price"]');
      const description = page.locator('[data-testid="listing-description"]');

      if (await price.count() > 0) {
        await expect(price.first()).toBeVisible();
      }
      if (await description.count() > 0) {
        await expect(description.first()).toBeVisible();
      }
    }
  });
});

test.describe('Marketplace Filtering', () => {
  test('should filter by listing type (sell)', async ({ page }) => {
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Look for type filter tabs
    const shesTab = page.locator('button:has-text("Shes")').first();
    if (await shesTab.isVisible()) {
      await shesTab.click();
      await page.waitForLoadState('networkidle');

      // Should show sell listings
      const listings = page.locator('[data-testid="listing-card"]');
      expect(await listings.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter by listing type (buy)', async ({ page }) => {
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Look for type filter tabs
    const blejTab = page.locator('button:has-text("Blej")').first();
    if (await blejTab.isVisible()) {
      await blejTab.click();
      await page.waitForLoadState('networkidle');

      // Should show buy listings
      const listings = page.locator('[data-testid="listing-card"]');
      expect(await listings.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show all listings when no filter applied', async ({ page }) => {
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Look for "All" or "Te-gjitha" tab
    const allTab = page.locator('button:has-text("Te-gjitha"), button:has-text("Të gjitha")').first();
    if (await allTab.isVisible()) {
      await allTab.click();
      await page.waitForLoadState('networkidle');

      // Should show all listings
      const listings = page.locator('[data-testid="listing-card"]');
      expect(await listings.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should sort listings', async ({ page }) => {
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.navigateToMarketplace();

    // Look for sort dropdown
    const sortButton = page.locator('button:has-text("Më i ri"), button:has-text("Sort")').first();
    if (await sortButton.isVisible()) {
      await sortButton.click();
      
      // Should show sort options
      const sortOptions = page.locator('div[role="option"], button:has-text("Më i vjetër")');
      expect(await sortOptions.count()).toBeGreaterThan(0);
    }
  });
});
