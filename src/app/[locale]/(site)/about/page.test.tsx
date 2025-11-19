import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { function } from "page"

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
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Target: () => <div data-testid="target-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
  Users: () => <div data-testid="users-icon" />,
  CheckCircle: () => <div data-testid="checkcircle-icon" />,
  ArrowRight: () => <div data-testid="arrowright-icon" />,
}))

describe("function component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <function />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <function />
    )
    expect(container).toBeInTheDocument()
  })
})