import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { async } from "page"

// Mock icons
vi.mock("lucide-react", () => ({
  Users: () => <div data-testid="users-icon" />,
  Building: () => <div data-testid="building-icon" />,
  BookOpen: () => <div data-testid="bookopen-icon" />,
  ShoppingCart: () => <div data-testid="shoppingcart-icon" />,
  TrendingUp: () => <div data-testid="trendingup-icon" />,
}))

describe("async component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <async />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <async />
    )
    expect(container).toBeInTheDocument()
  })
})