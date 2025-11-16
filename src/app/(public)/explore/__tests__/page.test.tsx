import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import EksploroPage from "../page"

// Mock Next.js Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock the CTA component
vi.mock("../cta", () => ({
  EksploroCTA: () => <div data-testid="eksploro-cta">Eksploro CTA</div>,
}))

describe("EksploroPage", () => {
  it("renders the explore page", () => {
    const { container } = render(EksploroPage())
    expect(container).toBeTruthy()
  })

  it("displays explore opportunities tagline", () => {
    render(EksploroPage())
    const tagline = screen.getByText(/Zbulo Mundësitë e Pafundme/i)
    expect(tagline).toBeInTheDocument()
  })

  it("displays feature sections", () => {
    render(EksploroPage())
    const networking = screen.getByText(/Rrjetëzimi/i)
    expect(networking).toBeInTheDocument()
  })

  it("renders the CTA component", () => {
    render(EksploroPage())
    const cta = screen.getByTestId("eksploro-cta")
    expect(cta).toBeInTheDocument()
  })

  it("has proper page structure", () => {
    const { container } = render(EksploroPage())
    const sections = container.querySelectorAll("div[class*='py-24']")
    expect(sections.length).toBeGreaterThan(0)
  })
})
