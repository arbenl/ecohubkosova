import { test, expect } from '@playwright/test';

test('App loads successfully', async ({ page }) => {
  // Navigate to home page (will redirect with i18n middleware)
  await page.goto('/', { waitUntil: 'networkidle' });
  
  // Check if we're on the Albanian version
  const url = page.url();
  console.log('Current URL:', url);
  
  // Should have /sq in URL due to i18n middleware
  expect(url).toContain('/sq');
  
  // Check if page has loaded content
  const pageContent = await page.content();
  expect(pageContent.length).toBeGreaterThan(100);
  
  console.log('✅ App loaded successfully');
});

test('Auth pages load with i18n', async ({ page }) => {
  // Navigate to login page
  await page.goto('/sq/auth/login', { waitUntil: 'networkidle' });
  
  const url = page.url();
  console.log('Login page URL:', url);
  
  expect(url).toContain('/sq/auth/login');
  console.log('✅ Login page loaded');
});
