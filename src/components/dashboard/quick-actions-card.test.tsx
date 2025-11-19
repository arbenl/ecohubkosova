import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { QuickActionsCard } from "quick-actions-card"

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
  ShoppingCart: () => <div data-testid="shoppingcart-icon" />,
  Users: () => <div data-testid="users-icon" />,
  BookOpen: () => <div data-testid="bookopen-icon" />,
  User: () => <div data-testid="user-icon" />,
}))

describe("QuickActionsCard component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <QuickActionsCard />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <QuickActionsCard />
    )
    expect(container).toBeInTheDocument()
  })
})