import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import PartnerePage from "../page"

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock CTA component
vi.mock("../cta", () => ({
  PartnereCTA: () => <div data-testid="partnere-cta">Partners CTA</div>,
}))

describe("PartnerePage", () => {
  it("renders the partners page", () => {
    const { container } = render(PartnerePage())
    expect(container).toBeTruthy()
  })

  it("displays partners network tagline", () => {
    render(PartnerePage())
    const tagline = screen.getByText(/Rrjeti ynë i fuqishëm/i)
    expect(tagline).toBeInTheDocument()
  })

  it("displays partner network description", () => {
    render(PartnerePage())
    const description = screen.getByText(/Zbulo rrjetin tonë të partnerëve/i)
    expect(description).toBeInTheDocument()
  })

  it("displays statistics about partners", () => {
    render(PartnerePage())
    const organizationStats = screen.getByText(/50\+/i)
    expect(organizationStats).toBeInTheDocument()
  })

  it("renders the CTA component", () => {
    render(PartnerePage())
    const cta = screen.getByTestId("partnere-cta")
    expect(cta).toBeInTheDocument()
  })

  it("has proper page structure", () => {
    const { container } = render(PartnerePage())
    const sections = container.querySelectorAll("div[class*='py-24']")
    expect(sections.length).toBeGreaterThan(0)
  })
})
