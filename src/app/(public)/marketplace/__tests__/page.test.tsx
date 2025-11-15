import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import TreguPage from "../page"

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock server components
vi.mock("../tregu-client-page", () => ({
  default: () => <div data-testid="tregu-client-page">Marketplace Client Page</div>,
}))

vi.mock("../actions", () => ({
  getListingsData: vi.fn().mockResolvedValue({
    initialListings: [],
    hasMoreInitial: false,
    error: null,
  }),
}))

vi.mock("@/lib/supabase/server", () => ({
  getServerUser: vi.fn().mockResolvedValue({ user: null }),
}))

describe("TreguPage (Marketplace)", () => {
  it("renders the marketplace page", async () => {
    const { container } = render(
      await TreguPage({
        searchParams: Promise.resolve({}),
      })
    )
    expect(container).toBeTruthy()
  })

  it("displays the marketplace heading", async () => {
    render(
      await TreguPage({
        searchParams: Promise.resolve({}),
      })
    )
    const heading = screen.getByText(/Tregu i Ekonomisë Qarkulluese/i)
    expect(heading).toBeInTheDocument()
  })

  it("renders the client page component", async () => {
    render(
      await TreguPage({
        searchParams: Promise.resolve({}),
      })
    )
    const clientPage = screen.getByTestId("tregu-client-page")
    expect(clientPage).toBeInTheDocument()
  })

  it("handles search parameters", async () => {
    render(
      await TreguPage({
        searchParams: Promise.resolve({ search: "test", lloji: "shes" }),
      })
    )
    expect(screen.getByTestId("tregu-client-page")).toBeInTheDocument()
  })

  it("renders the main container", async () => {
    const { container } = render(
      await TreguPage({
        searchParams: Promise.resolve({}),
      })
    )
    const main = container.querySelector("main")
    expect(main).toBeInTheDocument()
  })
})
