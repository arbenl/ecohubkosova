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
    await this.page.goto('/auth/register');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToLogin(): Promise<void> {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToHome(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
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
    await this.page.fill(this.fullNameInput, data.fullName);
    await this.page.fill(this.emailInput, data.email);
    await this.page.fill(this.passwordInput, data.password);
    await this.page.fill(this.confirmPasswordInput, data.confirmPassword);
    await this.page.fill(this.locationInput, data.location);
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
    await this.page.click(roleMap[role]);
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
    await this.page.fill('input[name="emri_organizates"]', data.organizationName);
    await this.page.fill('textarea[name="pershkrimi_organizates"]', data.description);
    await this.page.fill('input[name="interesi_primar"]', data.primaryInterest);
    await this.page.fill('input[name="person_kontakti"]', data.contactPerson);
    await this.page.fill('input[name="email_kontakti"]', data.contactEmail);
  }

  /**
   * Accept terms and conditions (Step 3)
   */
  async acceptTermsAndConditions(): Promise<void> {
    await this.page.click('input[name="terms"]');
  }

  /**
   * Optionally subscribe to newsletter
   */
  async subscribeToNewsletter(): Promise<void> {
    await this.page.click('input[name="newsletter"]');
  }

  /**
   * Click "Continue" button to move to next step
   */
  async clickContinue(): Promise<void> {
    await this.page.click(this.continueButton);
    // Wait for step transition
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click "Back" button to go to previous step
   */
  async clickBack(): Promise<void> {
    await this.page.click(this.backButton);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Submit registration form
   */
  async submitRegistration(): Promise<void> {
    await this.page.click(this.registerButton);
  }

  // ============= Login Flow =============

  /**
   * Fill and submit login form
   */
  async login(email: string, password: string): Promise<void> {
    await this.page.fill(this.loginEmailInput, email);
    await this.page.fill(this.loginPasswordInput, password);
    await this.page.click(this.loginButton);
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
    await this.page.waitForURL('/auth/success', { timeout: 5000 });
    const pageUrl = this.page.url();
    expect(pageUrl).toContain('/auth/success');
  }

  /**
   * Verify login success (redirect to dashboard)
   */
  async verifyLoginSuccess(): Promise<void> {
    await this.page.waitForURL('/(private)/**', { timeout: 5000 });
    const pageUrl = this.page.url();
    expect(pageUrl).not.toContain('/auth/login');
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
    await expect(this.page).toHaveURL('/auth/register');
  }

  /**
   * Verify we're on the login page
   */
  async verifyOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL('/auth/login');
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
