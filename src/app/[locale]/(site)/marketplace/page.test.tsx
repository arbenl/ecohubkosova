import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import MarketplaceClientPage from "./marketplace-client-page"

// Mock translations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock UI components
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: any) => (
    <div onClick={() => onValueChange("test")}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <button>{children}</button>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectValue: () => <div>SelectValue</div>,
}))

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

// Mock ListingCard
vi.mock("@/components/marketplace-v2/ListingCardV2", () => ({
  ListingCardV2: ({ listing }: any) => <div data-testid="listing-card">{listing.title}</div>,
}))

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("MarketplaceClientPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading state initially", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ listings: [], hasMore: false }),
    })

    render(<MarketplaceClientPage locale="en" initialSearchParams={{}} />)
    expect(screen.getByText("loadingListings")).toBeInTheDocument()
  })

  it("renders listings after fetch", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        listings: [{ id: "1", title: "Test Listing", condition: "new" }],
        hasMore: false,
      }),
    })

    render(<MarketplaceClientPage locale="en" initialSearchParams={{}} />)

    await waitFor(() => {
      expect(screen.queryByText("loadingListings")).not.toBeInTheDocument()
    })

    expect(screen.getByTestId("listing-card")).toBeInTheDocument()
    expect(screen.getByText("Test Listing")).toBeInTheDocument()
  })

  it("handles fetch error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"))

    render(<MarketplaceClientPage locale="en" initialSearchParams={{}} />)

    await waitFor(() => {
      expect(screen.getByText("errorLoading")).toBeInTheDocument()
    })
  })
})
