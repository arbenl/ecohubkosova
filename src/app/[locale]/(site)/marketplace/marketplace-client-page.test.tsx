import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, beforeEach, vi, afterEach } from "vitest"
import MarketplaceClientPage from "./marketplace-client-page"

// Mock translations to simple echo values
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

// Simplify ListingCardV2 to avoid Radix/Intl complexity
vi.mock("@/components/marketplace-v2/ListingCardV2", () => ({
  ListingCardV2: ({ listing }: { listing: { title: string } }) => (
    <div data-testid="listing-card">{listing.title}</div>
  ),
}))

describe("MarketplaceClientPage filter → request wiring", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ listings: [], hasMore: false }),
    })
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it("does not send category when selecting 'all categories'", async () => {
    render(<MarketplaceClientPage locale="sq" initialSearchParams={{ category: "all" }} />)

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).not.toContain("category=")
    expect(url).toContain("locale=sq")
  })

  it("sends category slug when a specific category is selected", async () => {
    const user = userEvent.setup()
    render(<MarketplaceClientPage locale="sq" initialSearchParams={{}} />)

    // Wait for initial load
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    const trigger = screen.getByTestId("category-trigger")
    await user.selectOptions(trigger, "recycled-metals")

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("category=recycled-metals"),
        expect.anything()
      )
    )
  })
})
