import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import HomePage from "../page"

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock the landing auth panel component
vi.mock("@/components/landing/landing-auth-panel", () => ({
  LandingAuthPanel: () => <div data-testid="landing-auth-panel">Landing Auth Panel</div>,
}))

describe("HomePage", () => {
  it("renders the main hero section", async () => {
    const { container } = render(await HomePage())
    expect(container).toBeTruthy()
  })

  it("displays the main tagline", async () => {
    render(await HomePage())
    const tagline = screen.getByText(/Mbështetur nga Koalicioni i Ekonomisë Qarkulluese/i)
    expect(tagline).toBeInTheDocument()
  })

  it("displays the description about circular economy", async () => {
    render(await HomePage())
    const description = screen.getByText(/Platforma e parë e ekonomisë qarkulluese në Kosovë/i)
    expect(description).toBeInTheDocument()
  })

  it("renders call-to-action buttons", async () => {
    render(await HomePage())
    const buttons = screen.getAllByText(/Fillo Bashkëpunimin/i)
    expect(buttons.length).toBeGreaterThan(0)
  })

  it("renders the landing auth panel", async () => {
    render(await HomePage())
    const authPanel = screen.getByTestId("landing-auth-panel")
    expect(authPanel).toBeInTheDocument()
  })

  it("displays the 'How It Works' section", async () => {
    render(await HomePage())
    const howItWorks = screen.getByText(/Si Funksionon/i)
    expect(howItWorks).toBeInTheDocument()
  })

  it("has proper structure with main element", async () => {
    const { container } = render(await HomePage())
    const main = container.querySelector("main")
    expect(main).toBeInTheDocument()
  })
})
