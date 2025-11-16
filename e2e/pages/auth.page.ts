import { Page, expect } from '@playwright/test';

/**
 * Page Object for Authentication pages (register, login, logout)
 * Encapsulates all selectors and interactions for auth flows
 *
 * Usage:
 * const authPage = new AuthPage(page);
 * await authPage.navigateToRegister();
 * await authPage.fillBasicInfo({ ... });
 */
export class AuthPage {
  readonly page: Page;

  // Selectors
  private readonly fullNameInput = 'input[name="emri_i_plote"]';
  private readonly emailInput = 'input[name="email"]';
  private readonly passwordInput = 'input[name="password"]';
  private readonly confirmPasswordInput = 'input[name="confirmPassword"]';
  private readonly locationInput = 'input[name="vendndodhja"]';
  private readonly continueButton = 'button:has-text("Vazhdo")';
  private readonly backButton = 'button:has-text("Kthehu")';
  private readonly registerButton = 'button:has-text("Regjistrohu")';
  private readonly signOutButton = '[data-testid="sign-out-button"]';
  private readonly errorAlert = '[class*="bg-red-50"]';
  private readonly successCheckmark = 'svg path[d*="5 13l4 4L19 7"]';

  // Login page selectors
  private readonly loginEmailInput = 'input[type="email"]';
  private readonly loginPasswordInput = 'input[type="password"]';
  private readonly loginButton = 'button:has-text("Kyçu")';
  private readonly googleSignInButton = 'button:has-text("Kyçu me Google")';

  constructor(page: Page) {
    this.page = page;
  }

  // ============= Navigation =============

  async navigateToRegister(): Promise<void> {
    await this.page.goto('/sq/register');
    await this.page.waitForTimeout(500);
  }

  async navigateToLogin(): Promise<void> {
    await this.page.goto('/sq/login');
    await this.page.waitForTimeout(500);
  }

  async navigateToHome(): Promise<void> {
    await this.page.goto('/sq');
    await this.page.waitForTimeout(500);
  }

  // ============= Registration Flow =============

  /**
   * Fill out Step 1: Basic Information
   * @param data User's basic info (name, email, password, location)
   */
  async fillBasicInfo(data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    location: string;
  }): Promise<void> {
    await this.page.locator(this.fullNameInput).fill(data.fullName);
    await this.page.locator(this.emailInput).fill(data.email);
    await this.page.locator(this.passwordInput).fill(data.password);
    await this.page.locator(this.confirmPasswordInput).fill(data.confirmPassword);
    await this.page.locator(this.locationInput).fill(data.location);
  }

  /**
   * Select user role (Individual, NGO, Social Enterprise, or Company)
   */
  async selectRole(
    role: 'Individ' | 'OJQ' | 'Ndërmarrje Sociale' | 'Kompani'
  ): Promise<void> {
    const roleMap = {
      'Individ': '#individ',
      'OJQ': '#ojq',
      'Ndërmarrje Sociale': '#ndermarrje',
      'Kompani': '#kompani',
    };
    await this.page.locator(roleMap[role]).click();
  }

  /**
   * Fill out Step 2: Organization Details (for non-individual roles)
   */
  async fillOrganizationInfo(data: {
    organizationName: string;
    description: string;
    primaryInterest: string;
    contactPerson: string;
    contactEmail: string;
  }): Promise<void> {
    await this.page.locator('input[name="emri_organizates"]').fill(data.organizationName);
    await this.page.locator('textarea[name="pershkrimi_organizates"]').fill(data.description);
    await this.page.locator('input[name="interesi_primar"]').fill(data.primaryInterest);
    await this.page.locator('input[name="person_kontakti"]').fill(data.contactPerson);
    await this.page.locator('input[name="email_kontakti"]').fill(data.contactEmail);
  }

  /**
   * Accept terms and conditions (Step 3)
   */
  async acceptTermsAndConditions(): Promise<void> {
    await this.page.locator('input[name="terms"]').click();
  }

  /**
   * Optionally subscribe to newsletter
   */
  async subscribeToNewsletter(): Promise<void> {
    await this.page.locator('input[name="newsletter"]').click();
  }

  /**
   * Click "Continue" button to move to next step
   */
  async clickContinue(): Promise<void> {
    await this.page.locator(this.continueButton).click();
    // Wait for step transition
    await this.page.waitForTimeout(300);
  }

  /**
   * Click "Back" button to go to previous step
   */
  async clickBack(): Promise<void> {
    await this.page.locator(this.backButton).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Submit registration form
   */
  async submitRegistration(): Promise<void> {
    await this.page.locator(this.registerButton).click();
  }

  // ============= Login Flow =============

  /**
   * Fill and submit login form
   */
  async login(email: string, password: string): Promise<void> {
    await this.page.locator(this.loginEmailInput).fill(email);
    await this.page.locator(this.loginPasswordInput).fill(password);
    await this.page.locator(this.loginButton).click();
  }

  /**
   * Sign out from the application
   */
  async signOut(): Promise<void> {
    // First, navigate to dashboard or any authenticated page
    // Then click sign out button
    const signOutBtn = this.page.locator(this.signOutButton);
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
    }
  }

  // ============= Assertions & Verification =============

  /**
   * Verify registration success (redirect to success page)
   */
  async verifyRegistrationSuccess(): Promise<void> {
    await this.page.waitForURL('/sq/success', { timeout: 5000 });
    const pageUrl = this.page.url();
    expect(pageUrl).toContain('/sq/success');
  }

  /**
   * Verify login success (redirect to dashboard)
   */
  async verifyLoginSuccess(): Promise<void> {
    // Wait for navigation away from login page
    await this.page.waitForURL(/.*(?!\/login).*/, { timeout: 5000 });
    const pageUrl = this.page.url();
    expect(pageUrl).not.toContain('/login');
  }

  /**
   * Verify error message is displayed
   */
  async verifyErrorMessage(expectedMessage?: string): Promise<void> {
    const error = this.page.locator(this.errorAlert);
    await expect(error).toBeVisible();

    if (expectedMessage) {
      const errorText = await error.textContent();
      expect(errorText).toContain(expectedMessage);
    }
  }

  /**
   * Verify no error is shown
   */
  async verifyNoError(): Promise<void> {
    const error = this.page.locator(this.errorAlert);
    await expect(error).not.toBeVisible();
  }

  /**
   * Verify we're on the register page
   */
  async verifyOnRegisterPage(): Promise<void> {
    await expect(this.page).toHaveURL('/sq/register');
  }

  /**
   * Verify we're on the login page
   */
  async verifyOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL('/sq/login');
  }

  /**
   * Get current step number from description
   */
  async getCurrentStep(): Promise<number> {
    const description = this.page.locator('h2 + div'); // CardDescription
    const text = await description.textContent();
    const match = text?.match(/Hapi (\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Verify form validation error
   */
  async verifyValidationError(): Promise<void> {
    await this.verifyErrorMessage();
  }

  /**
   * Check if continue button is disabled
   */
  async isContinueButtonDisabled(): Promise<boolean> {
    const button = this.page.locator(this.continueButton);
    return await button.isDisabled();
  }

  /**
   * Get all input values for verification
   */
  async getFormData(): Promise<Record<string, string>> {
    const fullName = await this.page.inputValue(this.fullNameInput);
    const email = await this.page.inputValue(this.emailInput);
    const location = await this.page.inputValue(this.locationInput);

    return {
      fullName: fullName || '',
      email: email || '',
      location: location || '',
    };
  }
}
