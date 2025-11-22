import { test, expect } from '@playwright/test'

test.describe('Marketplace Smoke Tests', () => {
    test('should load marketplace page in Albanian', async ({ page }) => {
        await page.goto('/sq/marketplace')

        // Verify page loads
        await expect(page.locator('body')).toBeVisible()

        // Verify H1 title from translations (sq/marketplace.json -> title)
        await expect(page.locator('h1')).toContainText('Tregu i Ekonomisë Qarkulluese')
    })

    test('should load marketplace page in English', async ({ page }) => {
        await page.goto('/en/marketplace')

        // Verify URL stays on /en/
        await expect(page).toHaveURL(/\/en\/marketplace/)

        // Verify page loads
        await expect(page.locator('body')).toBeVisible()

        // Verify H1 title from translations (en/marketplace.json -> title)
        await expect(page.locator('h1')).toContainText('Circular Economy Marketplace')
    })

    test('should display search input', async ({ page }) => {
        await page.goto('/sq/marketplace')

        // Verify search input exists and is visible
        const searchInput = page.locator('input[name="search"]')
        await expect(searchInput).toBeVisible()

        // Verify placeholder (sq/marketplace.json -> searchPlaceholder)
        await expect(searchInput).toHaveAttribute('placeholder', 'Kërko sipas titullit ose përshkrimit...')
    })

    test('should update filter state when clicked', async ({ page }) => {
        await page.goto('/sq/marketplace')

        // Click "Për Shitje" button (filterTypes.forSale)
        const forSaleBtn = page.getByRole('button', { name: 'Për Shitje' })
        await forSaleBtn.click()

        // Verify button becomes active (default variant has bg-primary)
        await expect(forSaleBtn).toHaveClass(/bg-primary/)
    })
})
