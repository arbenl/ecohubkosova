# E2E Testing Strategy: The Path to a Bulletproof Application

## 1. Current State Assessment

The project is in an excellent position to build a comprehensive End-to-End (E2E) testing suite.

*   **Configuration:** Your Playwright setup (`playwright.config.ts`) is outstanding. It correctly configures multiple browsers, parallel execution, automatic retries on CI, and a web server to start the application. No changes are needed here.
*   **Test Coverage:** The `e2e/` directory currently contains only the default example test. This means that while the foundation is solid, there is no E2E test coverage for any of the application's user flows.

This document provides a clear, actionable strategy for building out this test suite.

---

## 2. Prioritized Test Plan

We will approach this in phases, starting with the most critical user journeys.

### Priority 0: The Critical Path

These tests ensure that users can sign up, log in, and perform the single most important action in the application.

1.  **Successful User Registration:** A new user can fill out the registration form and create an account.
2.  **Successful User Login & Logout:** A registered user can log in, see the dashboard, and successfully log out.
3.  **Create a Marketplace Listing:** An authenticated user can navigate to the "Create Listing" page, fill out the form, and successfully submit a new listing.

### Priority 1: Core Functionality

These tests cover the main features that users will interact with daily.

1.  **Marketplace Filtering:** A user can search, filter by category, and sort listings on the marketplace page, and the results update correctly.
2.  **Profile Editing:** A logged-in user can navigate to their profile, update their personal information, and see the changes persist.
3.  **View Listing Details:** A user can click on a listing from the marketplace and view its details page.

### Priority 2: Admin Scenarios

These tests ensure that administrative functions are working correctly.

1.  **Admin Login:** A user with the 'admin' role can log in and see the admin dashboard.
2.  **View Admin Tables:** An admin can navigate to the Users, Organizations, or Listings tables and see the data.
3.  **Delete an Item:** An admin can successfully delete a user, organization, or listing from the respective admin table.

---

## 3. Recommended Test Structure

To keep the test suite organized and scalable, we should structure the `e2e/` directory by feature or domain.

```
e2e/
├── auth/
│   ├── registration.spec.ts
│   └── login.spec.ts
├── marketplace/
│   ├── create-listing.spec.ts
│   └── filtering.spec.ts
├── profile/
│   └── edit-profile.spec.ts
└── admin/
    ├── auth.spec.ts
    └── listings.spec.ts
```

---

## 4. Best Practices for Maintainable Tests

To ensure our tests are easy to read, write, and maintain, we will adopt the following best practices.

### a. The Page Object Model (POM)

Instead of writing selectors and logic directly in test files, we will abstract them into "Page" classes. This makes tests more readable and easier to update if the UI changes.

**Example: `e2e/pages/LoginPage.ts`**
```typescript
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Kyçu' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### b. Authentication Helpers

We will create helper functions to handle common tasks like logging in. This avoids repeating the same login steps in every test.

**Example: `e2e/helpers/auth.ts`**
```typescript
import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export async function loginAsUser(page: Page, email = 'user@example.com', password = 'password123') {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await page.waitForURL('/dashboard'); // Or whatever the post-login page is
}
```

### c. Use Data Attributes for Selectors

To make tests resilient to UI and text changes, we should add `data-testid` attributes to key elements in the application's code and use them in our tests.

**In your React Component:**
```jsx
<button data-testid="submit-login-button">Kyçu</button>
```

**In your Playwright Test:**
```typescript
page.getByTestId('submit-login-button').click();
```

---

## 5. Your First Test: Login

To get started, here is a complete, copy-pasteable example for your first critical test.

**File: `e2e/auth/login.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage'; // Assuming you create this POM

test.describe('Authentication', () => {
  test('should allow a user to log in and be redirected to the dashboard', async ({ page }) => {
    // 1. Setup
    const loginPage = new LoginPage(page);

    // 2. Action
    await loginPage.goto();
    await loginPage.login('testuser@example.com', 'password123'); // Use a pre-existing test user

    // 3. Assertion
    // Check that the URL is now the dashboard
    await expect(page).toHaveURL('/dashboard');

    // Check that a key element of the dashboard is visible
    await expect(page.getByRole('heading', { name: 'Mirë se erdhe' })).toBeVisible();
  });

  test('should show an error message with invalid credentials', async ({ page }) => {
    // 1. Setup
    const loginPage = new LoginPage(page);

    // 2. Action
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'wrongpassword');

    // 3. Assertion
    // Check that we are still on the login page
    await expect(page).toHaveURL('/login');

    // Check that an error message is displayed
    const errorMessage = page.getByRole('alert'); // Or a more specific selector
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Kredencialet e pavlefshme');
  });
});
```

This strategy provides a clear path to building a robust E2E testing suite that will give you confidence in every deployment.
