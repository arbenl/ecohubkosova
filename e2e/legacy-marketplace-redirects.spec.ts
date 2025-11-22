import { test, expect } from '@playwright/test'

test.describe('Legacy Marketplace Redirects', () => {
  test('should redirect /marketplace-v2 to /marketplace', async ({ page }) => {
    // Navigate to old marketplace-v2 URL
    await page.goto('/en/marketplace-v2')
    
    // Should redirect to new marketplace
    await expect(page).toHaveURL('/en/marketplace')
    
    // Should display marketplace landing page
    await expect(page.locator('main')).toBeVisible()
  })

  test('should redirect /marketplace-v2/[id] to /marketplace/[id]', async ({ page }) => {
    // Use a dummy ID - the redirect should happen regardless
    const dummyId = 'test-listing-id'
    
    // Navigate to old marketplace-v2 detail URL
    await page.goto(`/en/marketplace-v2/${dummyId}`)
    
    // Should redirect to new marketplace detail
    await expect(page).toHaveURL(`/en/marketplace/${dummyId}`)
  })

  test('should redirect /marketplace-v2/add to /marketplace/add', async ({ page }) => {
    // Navigate to old marketplace-v2 add URL
    await page.goto('/en/marketplace-v2/add')
    
    // Should redirect to new marketplace add
    await expect(page).toHaveURL('/en/marketplace/add')
  })

  test('should redirect /marketplace-v2/[id]/edit to /marketplace/[id]', async ({ page }) => {
    // Use a dummy ID
    const dummyId = 'test-listing-id'
    
    // Navigate to old marketplace-v2 edit URL
    await page.goto(`/en/marketplace-v2/${dummyId}/edit`)
    
    // Should redirect to new marketplace detail
    await expect(page).toHaveURL(`/en/marketplace/${dummyId}`)
  })

  test('should redirect /sq/marketplace-v2 to /sq/marketplace (Albanian locale)', async ({ page }) => {
    // Navigate to old marketplace-v2 URL in Albanian
    await page.goto('/sq/marketplace-v2')
    
    // Should redirect to new marketplace in same locale
    await expect(page).toHaveURL('/sq/marketplace')
    
    // Should display marketplace landing page
    await expect(page.locator('main')).toBeVisible()
  })

  test('should preserve locale when redirecting marketplace-v2 routes', async ({ page }) => {
    // Test with Albanian locale
    const testCases = [
      { from: '/sq/marketplace-v2', to: '/sq/marketplace' },
      { from: '/sq/marketplace-v2/some-id', to: '/sq/marketplace/some-id' },
      { from: '/sq/marketplace-v2/add', to: '/sq/marketplace/add' },
    ]

    for (const testCase of testCases) {
      await page.goto(testCase.from)
      await expect(page).toHaveURL(testCase.to)
    }
  })
})
