import { test, expect } from '@playwright/test'

test.describe('Marketplace Listings Tests', () => {
    test('should display listing cards or empty state', async ({ page }) => {
        await page.goto('/sq/marketplace')

        // Wait for either listing cards or empty state message to appear
        await page.waitForLoadState('networkidle')

        // Check if there are any listing cards
        const listingCards = page.locator('[data-testid="listing-card"]')
        const count = await listingCards.count()

        if (count > 0) {
            // If listings exist, verify at least one card is visible
            await expect(listingCards.first()).toBeVisible()
            console.log(`Found ${count} listing card(s)`)
        } else {
            // If no listings, verify the empty state message is shown
            const emptyMessage = page.getByText(/Nuk u gjetën shpallje që përputhen me kriteret|Asnjë ofertë|No listings/i)
            await expect(emptyMessage).toBeVisible()
            console.log('No listings found - empty state verified')
        }
    })

    test('should show listing card with required elements when listings exist', async ({ page }) => {
        await page.goto('/sq/marketplace')
        await page.waitForLoadState('networkidle')

        const listingCards = page.locator('[data-testid="listing-card"]')
        const count = await listingCards.count()

        // Only run this test if at least one listing exists
        test.skip(count === 0, 'No listings available to test')

        if (count > 0) {
            const firstCard = listingCards.first()

            // Verify the card is visible
            await expect(firstCard).toBeVisible()

            // Verify card has a title (h3)
            await expect(firstCard.locator('h3')).toBeVisible()

            // Verify card has a contact button
            const contactButton = firstCard.getByRole('button', { name: /kontakto/i })
            await expect(contactButton).toBeVisible()
        }
    })
})
