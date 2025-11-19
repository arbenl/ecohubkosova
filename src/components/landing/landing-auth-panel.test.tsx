import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingAuthPanel } from "landing-auth-panel"

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
  Loader2: () => <div data-testid="loader2-icon" />,
  UserPlus: () => <div data-testid="userplus-icon" />,
  LogIn: () => <div data-testid="login-icon" />,
  ArrowRight: () => <div data-testid="arrowright-icon" />,
}))

// Mock external dependencies

describe("LandingAuthPanel component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <LandingAuthPanel />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <LandingAuthPanel />
    )
    expect(container).toBeInTheDocument()
  })
})