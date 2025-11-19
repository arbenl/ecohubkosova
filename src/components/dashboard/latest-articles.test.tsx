import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LatestArticles } from "latest-articles"

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

describe("LatestArticles component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <LatestArticles />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <LatestArticles />
    )
    expect(container).toBeInTheDocument()
  })
})