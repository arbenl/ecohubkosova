import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Menubar } from "./menubar"

// Mock icons
vi.mock("lucide-react", () => ({
  Check: () => <div data-testid="check-icon" />,
  ChevronRight: () => <div data-testid="chevronright-icon" />,
  Circle: () => <div data-testid="circle-icon" />,
}))

// Mock external dependencies

describe("Menubar component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Menubar />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Menubar />
    )
    expect(container).toBeInTheDocument()
  })
})