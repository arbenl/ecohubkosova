import { test, expect, APIResponse } from "@playwright/test"

type ListingLite = {
  id: string
  title: string
  organization_contact_email?: string | null
}

const pickListingWithOrg = async (response: APIResponse) => {
  expect(response.ok()).toBeTruthy()
  const data = (await response.json()) as { listings: ListingLite[] }
  const listing = data.listings.find((l) => l.organization_contact_email)
  test.skip(!listing, "No listing with organization contact email available")
  return listing
}

test.describe("Marketplace contact + org profile", () => {
  test("shows org contact on listing detail", async ({ page, request }) => {
    const apiResponse = await request.get("/api/marketplace/listings?page=1&pageSize=10&locale=sq")
    const listing = await pickListingWithOrg(apiResponse)

    await page.goto(`/sq/marketplace/${listing.id}`)
    await expect(page.getByRole("heading", { level: 1, name: listing.title })).toBeVisible()

    // Reveal contact and assert mailto matches organization email
    const contactCard = page.getByRole("heading", { name: /Kontakt|Contact/i }).locator("..")
    await contactCard.getByRole("button").first().click()
    const mailtoLink = contactCard.locator('a[href^="mailto:"]').first()
    await expect(mailtoLink).toHaveAttribute("href", new RegExp(listing.organization_contact_email))
  })
})
