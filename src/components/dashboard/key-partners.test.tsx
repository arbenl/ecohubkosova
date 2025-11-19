import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { KeyPartners } from "key-partners"

// Mock hooks
vi.mock("@/hooks/use-dashboard-sections", () => ({
  useDashboardSections: vi.fn()
}))

// Mock Next.js
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock icons
vi.mock("lucide-react", () => ({
  ArrowRight: () => <div data-testid="arrowright-icon" />,
}))

describe("KeyPartners component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <KeyPartners />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <KeyPartners />
    )
    expect(container).toBeInTheDocument()
  })
})