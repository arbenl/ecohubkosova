import { Page, expect } from '@playwright/test';

/**
 * Page Object for Marketplace pages
 * Encapsulates all selectors and interactions for marketplace flows
 *
 * Usage:
 * const marketplacePage = new MarketplacePage(page);
 * await marketplacePage.navigateToMarketplace();
 * await marketplacePage.viewListings();
 */
export class MarketplacePage {
  readonly page: Page;

  // Navigation
  private readonly createListingButton = 'a:has-text("Shto listim të ri")';
  private readonly marketplaceLink = 'a:has-text("Treg")';

  // Listing form (create)
  private readonly titleInput = 'input[name="titulli"]';
  private readonly descriptionInput = 'textarea[name="pershkrimi"]';
  private readonly categorySelect = 'select[name="kategori"]';
  private readonly priceInput = 'input[name="cmimi"]';
  private readonly unitSelect = 'select[name="njesia"]';
  private readonly locationInput = 'input[name="vendndodhja"]';
  private readonly quantityInput = 'input[name="sasia"]';
  private readonly listingTypeRadio = 'input[name="lloji_listimit"]';
  private readonly submitButton = 'button:has-text("Shto")';

  // Listing view
  private readonly listingTitle = 'h1';
  private readonly listingPrice = '[data-testid="listing-price"]';
  private readonly listingDescription = '[data-testid="listing-description"]';
  private readonly contactButton = 'button:has-text("Kontakto")';
  private readonly listingCard = '[data-testid="listing-card"]';

  // Filters
  private readonly searchInput = 'input[placeholder*="Kërko"]';
  private readonly categoryFilter = '[data-testid="category-filter"]';
  private readonly typeFilter = '[data-testid="type-filter"]';

  // Messages
  private readonly successMessage = 'text=sukses';
  private readonly errorAlert = '[role="alert"]';

  constructor(page: Page) {
    this.page = page;
  }

  // ============= Navigation =============

  async navigateToMarketplace(): Promise<void> {
    await this.page.goto('/sq/marketplace');
    await this.page.waitForTimeout(1000);
  }

  async navigateToCreateListing(): Promise<void> {
    await this.page.goto('/sq/marketplace/shto');
    await this.page.waitForTimeout(1000);
  }

  async navigateToListingDetails(listingId: string): Promise<void> {
    await this.page.goto(`/sq/marketplace/${listingId}`);
    await this.page.waitForTimeout(1000);
  }

  // ============= Create Listing Flow =============

  /**
   * Fill listing creation form
   */
  async createListing(data: {
    title: string;
    description: string;
    category: string;
    price: string;
    unit: string;
    location: string;
    quantity: string;
    type: 'shes' | 'blej';
  }): Promise<void> {
    await this.page.waitForSelector(this.titleInput, { timeout: 5000 });
    await this.page.fill(this.titleInput, data.title);
    await this.page.fill(this.descriptionInput, data.description);
    await this.page.selectOption(this.categorySelect, data.category);
    await this.page.fill(this.priceInput, data.price);
    await this.page.selectOption(this.unitSelect, data.unit);
    await this.page.fill(this.locationInput, data.location);
    await this.page.fill(this.quantityInput, data.quantity);
    
    // Select listing type
    const typeRadio = this.page.locator(`input[value="${data.type}"]`);
    await typeRadio.click();
  }

  /**
   * Submit the listing creation form
   */
  async submitListing(): Promise<void> {
    await this.page.click(this.submitButton);
  }

  /**
   * Verify listing was created successfully
   */
  async verifyListingCreated(): Promise<void> {
    // Wait for success message
    await this.page.waitForSelector(this.successMessage, { timeout: 5000 });
    
    // Should redirect to marketplace after 3 seconds
    await this.page.waitForURL('/marketplace', { timeout: 5000 });
    expect(this.page.url()).toContain('/marketplace');
  }

  // ============= Browse Listings =============

  /**
   * Get all listing cards on the page
   */
  async getListingCards(): Promise<number> {
    return await this.page.locator(this.listingCard).count();
  }

  /**
   * Click on first listing to view details
   */
  async viewFirstListing(): Promise<void> {
    const firstCard = this.page.locator(this.listingCard).first();
    await firstCard.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for listings by keyword
   */
  async searchListings(query: string): Promise<void> {
    await this.page.fill(this.searchInput, query);
    await this.page.waitForTimeout(500); // Wait for search to process
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Filter by category
   */
  async filterByCategory(category: string): Promise<void> {
    const categoryButton = this.page.locator(`button:has-text("${category}")`).first();
    await categoryButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Filter by listing type (sell/buy)
   */
  async filterByType(type: 'shes' | 'blej'): Promise<void> {
    const typeLabel = type === 'shes' ? 'Shes' : 'Blej';
    const typeButton = this.page.locator(`button:has-text("${typeLabel}")`).first();
    await typeButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ============= Listing Details =============

  /**
   * Get listing title
   */
  async getListingTitle(): Promise<string | null> {
    return await this.page.locator(this.listingTitle).first().textContent();
  }

  /**
   * Get listing price
   */
  async getListingPrice(): Promise<string | null> {
    return await this.page.locator(this.listingPrice).first().textContent();
  }

  /**
   * Get listing description
   */
  async getListingDescription(): Promise<string | null> {
    return await this.page.locator(this.listingDescription).first().textContent();
  }

  /**
   * Contact listing seller
   */
  async contactSeller(): Promise<void> {
    await this.page.click(this.contactButton);
    await this.page.waitForLoadState('networkidle');
  }

  // ============= Assertions & Verification =============

  /**
   * Verify we're on marketplace page
   */
  async verifyOnMarketplacePage(): Promise<void> {
    await expect(this.page).toHaveURL('/sq/marketplace');
  }

  /**
   * Verify we're on create listing page
   */
  async verifyOnCreateListingPage(): Promise<void> {
    await expect(this.page).toHaveURL('/sq/marketplace/shto');
  }

  /**
   * Verify listings are displayed
   */
  async verifyListingsDisplayed(): Promise<void> {
    const cards = this.page.locator(this.listingCard);
    await expect(cards.first()).toBeVisible();
  }

  /**
   * Verify error message
   */
  async verifyError(): Promise<void> {
    const error = this.page.locator(this.errorAlert);
    await expect(error).toBeVisible();
  }

  /**
   * Verify no error is shown
   */
  async verifyNoError(): Promise<void> {
    const error = this.page.locator(this.errorAlert);
    await expect(error).not.toBeVisible();
  }

  /**
   * Verify create listing button is visible
   */
  async verifyCreateListingButtonVisible(): Promise<void> {
    const button = this.page.locator(this.createListingButton);
    await expect(button).toBeVisible();
  }

  /**
   * Verify create listing button is not visible (for logged out users)
   */
  async verifyCreateListingButtonNotVisible(): Promise<void> {
    const button = this.page.locator(this.createListingButton);
    await expect(button).not.toBeVisible();
  }

  /**
   * Verify listing details page shows all expected information
   */
  async verifyListingDetailsComplete(): Promise<void> {
    await expect(this.page.locator(this.listingTitle)).toBeVisible();
    await expect(this.page.locator(this.listingPrice)).toBeVisible();
    await expect(this.page.locator(this.listingDescription)).toBeVisible();
  }

  /**
   * Get form validation error message
   */
  async getValidationError(): Promise<string | null> {
    const errorElements = await this.page.locator('[class*="error"], [role="alert"]').all();
    if (errorElements.length > 0) {
      return await errorElements[0].textContent();
    }
    return null;
  }

  /**
   * Check if required field is empty
   */
  async isFieldEmpty(fieldName: 'title' | 'description' | 'price' | 'location'): Promise<boolean> {
    let selector = '';
    switch (fieldName) {
      case 'title':
        selector = this.titleInput;
        break;
      case 'description':
        selector = this.descriptionInput;
        break;
      case 'price':
        selector = this.priceInput;
        break;
      case 'location':
        selector = this.locationInput;
        break;
    }
    
    const value = await this.page.inputValue(selector);
    return !value || value.trim() === '';
  }

  /**
   * Verify user is logged out (create button not visible)
   */
  async verifyLoggedOut(): Promise<void> {
    await this.verifyCreateListingButtonNotVisible();
  }

  /**
   * Verify user is logged in (create button visible)
   */
  async verifyLoggedIn(): Promise<void> {
    await this.verifyCreateListingButtonVisible();
  }
}
