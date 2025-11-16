import { test as base, type Page } from '@playwright/test';
import { AuthPage } from './pages/auth.page';

type TestFixtures = {
  authPage: AuthPage;
};

/**
 * Fixture for Auth Page Object
 * Usage:
 * test('example', async ({ authPage }) => {
 *   await authPage.navigateToLogin();
 * });
 */
export const test = base.extend<TestFixtures>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },
});

export { expect } from '@playwright/test';
