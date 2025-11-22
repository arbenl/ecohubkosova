import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import MarketplaceClientPage from "./marketplace-client-page"
import { NextIntlClientProvider } from "next-intl"

// Mock hooks
vi.mock("@/hooks/use-marketplace-filters", () => ({
  useMarketplaceFilters: vi.fn(),
}))

// Mock next-intl
vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useLocale: () => "en",
}))

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  createClientSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  })),
}))

describe("MarketplaceClientPage component", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(
        <NextIntlClientProvider locale="en" messages={{}}>
          <MarketplaceClientPage locale="en" initialSearchParams={{}} showHero={true} />
        </NextIntlClientProvider>
      )
    ).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <MarketplaceClientPage locale="en" initialSearchParams={{}} showHero={false} />
      </NextIntlClientProvider>
    )
    expect(container).toBeInTheDocument()
  })
})
