import { test, expect, APIResponse } from "@playwright/test"
import type { MarketplaceListingsResponse } from "@/app/[locale]/(site)/marketplace-v2/types"

const fetchFirstListing = async (response: APIResponse) => {
    expect(response.ok()).toBeTruthy()
    const data = (await response.json()) as MarketplaceListingsResponse
    test.skip(!data.success || data.listings.length === 0, "No marketplace V2 listings to test")
    return data.listings[0]
}

test.describe("Marketplace V2 detail page", () => {
    test("should open a listing and show contact section", async ({ page, request }) => {
        const apiResponse = await request.get("/api/marketplace-v2/listings?limit=1&page=1")
        const listing = await fetchFirstListing(apiResponse)

        await page.goto("/sq/marketplace-v2")

        const listingLink = page.getByRole("link", { name: listing.title, exact: false })
        await expect(listingLink.first()).toBeVisible()
        await listingLink.first().click()

        await expect(page).toHaveURL(new RegExp(`/sq/marketplace-v2/${listing.id}`))
        await expect(page.getByRole("heading", { level: 1, name: listing.title })).toBeVisible()
        await expect(page.getByRole("heading", { name: /Kontakto|Contact/i })).toBeVisible()
    })
})
