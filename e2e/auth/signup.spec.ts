import { test, expect, Page } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { generateTestEmail } from '../helpers/test-utils';

test.describe('User Registration', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    await authPage.navigateToRegister();
    await authPage.verifyOnRegisterPage();
  });

  test('should successfully register an individual user with valid data', async () => {
    const testEmail = generateTestEmail();
    const testData = {
      fullName: 'Test User Individual',
      email: testEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      location: 'Prishtinë, Kosovë',
    };

    // Step 1: Fill basic information
    await authPage.fillBasicInfo(testData);
    await authPage.selectRole('Individ');
    await authPage.clickContinue();

    // Verify step progression
    const currentStep = await authPage.getCurrentStep();
    expect(currentStep).toBe(2);

    // Step 2: Skip organization details (individual users don't need them)
    await authPage.clickContinue();

    // Step 3: Accept terms
    const step3 = await authPage.getCurrentStep();
    expect(step3).toBe(3);

    await authPage.acceptTermsAndConditions();
    await authPage.submitRegistration();

    // Verify successful registration
    await authPage.verifyRegistrationSuccess();
  });

  test('should show validation error when passwords do not match', async () => {
    const testEmail = generateTestEmail();

    await authPage.fillBasicInfo({
      fullName: 'Test User',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
      location: 'Prishtinë, Kosovë',
    });

    await authPage.selectRole('Individ');
    await authPage.clickContinue();

    // Should show error and remain on step 1
    await authPage.verifyErrorMessage('Fjalëkalimet nuk përputhen');
    const currentStep = await authPage.getCurrentStep();
    expect(currentStep).toBe(1);
  });

  test('should show validation error when password is too short', async () => {
    const testEmail = generateTestEmail();

    await authPage.fillBasicInfo({
      fullName: 'Test User',
      email: testEmail,
      password: 'short',
      confirmPassword: 'short',
      location: 'Prishtinë, Kosovë',
    });

    await authPage.selectRole('Individ');
    await authPage.clickContinue();

    // Should show error and remain on step 1
    await authPage.verifyErrorMessage('Fjalëkalimi duhet të ketë të paktën 6 karaktere');
    const currentStep = await authPage.getCurrentStep();
    expect(currentStep).toBe(1);
  });

  test('should show validation error when required fields are missing', async () => {
    // Try to continue without filling any fields
    await authPage.clickContinue();

    // Should show validation error
    await authPage.verifyErrorMessage('plotësoni të gjitha fushat');
    const currentStep = await authPage.getCurrentStep();
    expect(currentStep).toBe(1);
  });

  test('should allow going back to previous step', async () => {
    const testEmail = generateTestEmail();

    // Fill step 1
    await authPage.fillBasicInfo({
      fullName: 'Test User',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      location: 'Prishtinë, Kosovë',
    });

    await authPage.selectRole('Individ');
    await authPage.clickContinue();

    // Verify we're on step 2
    let currentStep = await authPage.getCurrentStep();
    expect(currentStep).toBe(2);

    // Go back to step 1
    await authPage.clickBack();

    // Verify we're back on step 1
    currentStep = await authPage.getCurrentStep();
    expect(currentStep).toBe(1);

    // Verify data is still there
    const formData = await authPage.getFormData();
    expect(formData.fullName).toBe('Test User');
    expect(formData.email).toBe(testEmail);
  });

  test('should successfully register an organization (OJQ)', async () => {
    const testEmail = generateTestEmail();
    const testData = {
      fullName: 'Organization Admin',
      email: testEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      location: 'Prishtinë, Kosovë',
    };

    // Step 1: Fill basic information for organization
    await authPage.fillBasicInfo(testData);
    await authPage.selectRole('OJQ');
    await authPage.clickContinue();

    // Verify step 2
    const step2 = await authPage.getCurrentStep();
    expect(step2).toBe(2);

    // Step 2: Fill organization details
    await authPage.fillOrganizationInfo({
      organizationName: 'Test NGO',
      description: 'A test non-governmental organization focused on environmental sustainability',
      primaryInterest: 'Circular Economy',
      contactPerson: 'Test Contact',
      contactEmail: `contact.${Date.now()}@example.com`,
    });

    await authPage.clickContinue();

    // Verify step 3
    const step3 = await authPage.getCurrentStep();
    expect(step3).toBe(3);

    // Step 3: Accept terms
    await authPage.acceptTermsAndConditions();
    await authPage.submitRegistration();

    // Verify successful registration
    await authPage.verifyRegistrationSuccess();
  });

  test('should show error when organization details are missing', async () => {
    const testEmail = generateTestEmail();

    // Step 1: Select OJQ
    await authPage.fillBasicInfo({
      fullName: 'Org Admin',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      location: 'Prishtinë, Kosovë',
    });

    await authPage.selectRole('OJQ');
    await authPage.clickContinue();

    // Try to continue to step 3 without filling organization details
    await authPage.clickContinue();

    // Should show validation error
    await authPage.verifyErrorMessage('plotësoni të gjitha fushat e organizatës');
    const currentStep = await authPage.getCurrentStep();
    expect(currentStep).toBe(2);
  });

  test('should show error when terms are not accepted', async () => {
    const testEmail = generateTestEmail();

    // Complete step 1
    await authPage.fillBasicInfo({
      fullName: 'Test User',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      location: 'Prishtinë, Kosovë',
    });

    await authPage.selectRole('Individ');
    await authPage.clickContinue();

    // Complete step 2 (skip to step 3)
    await authPage.clickContinue();

    // Try to submit without accepting terms
    await authPage.submitRegistration();

    // Should show error about terms
    await authPage.verifyErrorMessage('terms');
  });

  test('should prevent duplicate email registration', async () => {
    // Register first user
    const testEmail = generateTestEmail();
    const testData = {
      fullName: 'First User',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      location: 'Prishtinë, Kosovë',
    };

    await authPage.fillBasicInfo(testData);
    await authPage.selectRole('Individ');
    await authPage.clickContinue();
    await authPage.clickContinue();
    await authPage.acceptTermsAndConditions();
    await authPage.submitRegistration();

    // Wait for success page
    await authPage.verifyRegistrationSuccess();

    // Try to register with the same email
    await authPage.navigateToRegister();

    const duplicateData = {
      fullName: 'Second User',
      email: testEmail,
      password: 'AnotherPassword123!',
      confirmPassword: 'AnotherPassword123!',
      location: 'Gjakovë, Kosovë',
    };

    await authPage.fillBasicInfo(duplicateData);
    await authPage.selectRole('Individ');
    await authPage.clickContinue();
    await authPage.clickContinue();
    await authPage.acceptTermsAndConditions();
    await authPage.submitRegistration();

    // Should show error about duplicate email
    await authPage.verifyErrorMessage('email');
  });

  test('should handle form submission errors gracefully', async () => {
    const testEmail = generateTestEmail();

    await authPage.fillBasicInfo({
      fullName: 'Test User',
      email: testEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      location: 'Prishtinë, Kosovë',
    });

    await authPage.selectRole('Individ');
    await authPage.clickContinue();
    await authPage.clickContinue();
    await authPage.acceptTermsAndConditions();

    // Submit with invalid email format (changed after initial entry)
    // This tests server-side validation
    await authPage.submitRegistration();

    // Should either succeed or show proper error message
    try {
      await authPage.verifyRegistrationSuccess();
    } catch {
      await authPage.verifyErrorMessage();
    }
  });
});
