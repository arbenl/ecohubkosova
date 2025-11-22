import { test, expect, APIResponse } from "@playwright/test"
import type { MarketplaceListingsResponse } from "@/app/[locale]/(site)/marketplace-v2/types"

const ensurePaginationData = async (response: APIResponse) => {
    expect(response.ok()).toBeTruthy()
    const data = (await response.json()) as MarketplaceListingsResponse
    test.skip(!data.success, "Marketplace V2 API unavailable")
    test.skip(data.totalCount <= data.limit, "Not enough listings for pagination")
    return data
}

test.describe("Marketplace V2 pagination", () => {
    test("should show pagination controls when there are multiple pages", async ({
        page,
        request,
    }) => {
        const apiResponse = await request.get("/api/marketplace-v2/listings?limit=12&page=1")
        const data = await ensurePaginationData(apiResponse)

        test.skip((data.totalPages ?? 0) < 2, "Pagination not applicable")

        await page.goto("/sq/marketplace-v2")

        const nextButton = page.getByRole("button", { name: /Next|Para/i })
        await expect(nextButton).toBeVisible()
        await expect(nextButton).toBeEnabled()
    })

    test("should update page param in URL when navigating with pagination", async ({
        page,
        request,
    }) => {
        const apiResponse = await request.get("/api/marketplace-v2/listings?limit=12&page=1")
        const data = await ensurePaginationData(apiResponse)

        test.skip((data.totalPages ?? 0) < 2, "Pagination not applicable")

        await page.goto("/sq/marketplace-v2?page=1")

        const nextButton = page.getByRole("button", { name: /Next|Para/i })
        await expect(nextButton).toBeVisible()
        await expect(nextButton).toBeEnabled()

        await nextButton.click()

        await expect(page).toHaveURL(/page=2/)
    })
})
