import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import RrethNeshPage from "../page"

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock CTA components
vi.mock("../cta", () => ({
  RrethNeshHeroCTA: () => <div data-testid="rreth-nesh-hero-cta">CTA</div>,
  RrethNeshBottomCTA: () => <div data-testid="rreth-nesh-bottom-cta">Bottom CTA</div>,
}))

describe("RrethNeshPage (About)", () => {
  it("renders the about page", () => {
    const { container } = render(RrethNeshPage())
    expect(container).toBeTruthy()
  })

  it("displays the mission statement", () => {
    render(RrethNeshPage())
    const mission = screen.getByText(/ECO HUB KOSOVA është platforma e parë/i)
    expect(mission).toBeInTheDocument()
  })

  it("renders mission and vision sections", () => {
    render(RrethNeshPage())
    const target = screen.getByTestId("rreth-nesh-hero-cta")
    expect(target).toBeInTheDocument()
  })

  it("displays the hero CTA component", () => {
    render(RrethNeshPage())
    const heroCta = screen.getByTestId("rreth-nesh-hero-cta")
    expect(heroCta).toBeInTheDocument()
  })

  it("has proper page structure", () => {
    const { container } = render(RrethNeshPage())
    const sections = container.querySelectorAll("div[class*='py-24']")
    expect(sections.length).toBeGreaterThan(0)
  })
})
