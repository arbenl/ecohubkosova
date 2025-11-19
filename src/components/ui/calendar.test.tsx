import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Calendar } from "./calendar"

// Mock icons
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevronleft-icon" />,
  ChevronRight: () => <div data-testid="chevronright-icon" />,
}))

// Mock external dependencies

describe("Calendar component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Calendar />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Calendar />
    )
    expect(container).toBeInTheDocument()
  })
})