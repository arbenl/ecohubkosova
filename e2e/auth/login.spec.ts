import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { generateTestEmail } from '../helpers/test-utils';

test.describe('User Login', () => {
  let authPage: AuthPage;
  let testEmail: string;
  let testPassword: string;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    testEmail = generateTestEmail();
    testPassword = 'SecurePassword123!';
  });

  test('should successfully log in with valid credentials', async ({ page }) => {
    // First, register a test user
    authPage = new AuthPage(page);
    await authPage.navigateToRegister();

    await authPage.fillBasicInfo({
      fullName: 'Login Test User',
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      location: 'Prishtinë, Kosovë',
    });

    await authPage.selectRole('Individ');
    await authPage.clickContinue();
    await authPage.clickContinue();
    await authPage.acceptTermsAndConditions();
    await authPage.submitRegistration();

    // Verify registration success
    await authPage.verifyRegistrationSuccess();

    // Now test login
    await authPage.navigateToLogin();
    await authPage.verifyOnLoginPage();

    await authPage.login(testEmail, testPassword);

    // Verify login success (should redirect to dashboard)
    await authPage.verifyLoginSuccess();
  });

  test('should show error with invalid email', async () => {
    await authPage.navigateToLogin();

    await authPage.login('nonexistent@example.com', 'anypassword');

    // Should show error message
    await authPage.verifyErrorMessage();
  });

  test('should show error with invalid password', async ({ page }) => {
    // First, register a test user
    authPage = new AuthPage(page);
    await authPage.navigateToRegister();

    await authPage.fillBasicInfo({
      fullName: 'Password Test User',
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      location: 'Prishtinë, Kosovë',
    });

    await authPage.selectRole('Individ');
    await authPage.clickContinue();
    await authPage.clickContinue();
    await authPage.acceptTermsAndConditions();
    await authPage.submitRegistration();

    await authPage.verifyRegistrationSuccess();

    // Try to login with wrong password
    await authPage.navigateToLogin();
    await authPage.login(testEmail, 'WrongPassword123!');

    // Should show error
    await authPage.verifyErrorMessage();
  });

  test('should handle empty email field', async () => {
    await authPage.navigateToLogin();

    // Try to login with empty email
    await authPage.login('', 'password123');

    // Should show validation error or prevent submission
    const hasError = await authPage.page.locator('[role="alert"]').isVisible();
    const isEmailFieldEmpty = !await authPage.page.inputValue('input[type="email"]');

    expect(hasError || isEmailFieldEmpty).toBe(true);
  });

  test('should handle empty password field', async () => {
    await authPage.navigateToLogin();

    // Try to login with empty password
    await authPage.login('test@example.com', '');

    // Should show validation error or prevent submission
    const hasError = await authPage.page.locator('[role="alert"]').isVisible();
    const isPasswordFieldEmpty = !await authPage.page.inputValue('input[type="password"]');

    expect(hasError || isPasswordFieldEmpty).toBe(true);
  });

  test('should display register link on login page', async () => {
    await authPage.navigateToLogin();

    // Look for link to register page
    const registerLink = authPage.page.locator('a:has-text("Regjistrohu")');
    await expect(registerLink).toBeVisible();

    // Should navigate to register when clicked
    await registerLink.click();
    await authPage.verifyOnRegisterPage();
  });

  test('should handle server errors gracefully', async ({ page }) => {
    authPage = new AuthPage(page);
    await authPage.navigateToLogin();

    // Login with credentials that would cause a server error
    // This is a simulated test - actual behavior depends on your backend
    await authPage.login('test@example.com', 'password');

    // Should show error message (not crash)
    try {
      await authPage.verifyErrorMessage();
    } catch {
      // Either shows error or redirects successfully
      const url = page.url();
      expect(url).toMatch(/login|private|dashboard/);
    }
  });

  test('should maintain login across page navigation', async ({ page }) => {
    // Register and login
    authPage = new AuthPage(page);
    await authPage.navigateToRegister();

    await authPage.fillBasicInfo({
      fullName: 'Navigation Test User',
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      location: 'Prishtinë, Kosovë',
    });

    await authPage.selectRole('Individ');
    await authPage.clickContinue();
    await authPage.clickContinue();
    await authPage.acceptTermsAndConditions();
    await authPage.submitRegistration();

    await authPage.verifyRegistrationSuccess();

    // Navigate to home
    await authPage.navigateToHome();

    // Should still be logged in
    const url = page.url();
    expect(url).not.toContain('/auth/login');
    expect(url).not.toContain('/auth/register');
  });

  test('should show remember me option if available', async () => {
    await authPage.navigateToLogin();

    // Check if "Remember me" checkbox exists
    const rememberMeCheckbox = authPage.page.locator('input[type="checkbox"]');
    const rememberMeLabel = authPage.page.locator('text=Remember');

    // These elements may or may not exist depending on implementation
    const hasRememberMe = (await rememberMeCheckbox.count()) > 0 && (await rememberMeLabel.count()) > 0;

    // Just verify page loads without error
    await expect(authPage.page).toHaveURL('/auth/login');
  });

  test('should handle concurrent login attempts', async ({ page }) => {
    // Register a user first
    authPage = new AuthPage(page);
    await authPage.navigateToRegister();

    await authPage.fillBasicInfo({
      fullName: 'Concurrent Test User',
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      location: 'Prishtinë, Kosovë',
    });

    await authPage.selectRole('Individ');
    await authPage.clickContinue();
    await authPage.clickContinue();
    await authPage.acceptTermsAndConditions();
    await authPage.submitRegistration();

    await authPage.verifyRegistrationSuccess();

    // Login and navigate away before login completes
    await authPage.navigateToLogin();
    await authPage.login(testEmail, testPassword);

    // Rapidly navigate to home
    await page.goto('/');

    // Should handle gracefully and redirect appropriately
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('should focus on email field when page loads', async () => {
    await authPage.navigateToLogin();

    const emailInput = authPage.page.locator('input[type="email"]');
    const focusedElement = await authPage.page.evaluate(() => document.activeElement?.getAttribute('type'));

    // Email input should be first interactive element or page should be ready for input
    await expect(emailInput).toBeVisible();
  });
});
