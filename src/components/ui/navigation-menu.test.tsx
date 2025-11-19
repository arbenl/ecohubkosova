import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { NavigationMenu } from "./navigation-menu"

// Mock icons
vi.mock("lucide-react", () => ({
  ChevronDown: () => <div data-testid="chevrondown-icon" />,
}))

// Mock external dependencies

describe("NavigationMenu component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <NavigationMenu />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <NavigationMenu />
    )
    expect(container).toBeInTheDocument()
  })
})