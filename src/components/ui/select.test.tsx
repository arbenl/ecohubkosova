import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Select } from "./select"

// Mock icons
vi.mock("lucide-react", () => ({
  Check: () => <div data-testid="check-icon" />,
  ChevronDown: () => <div data-testid="chevrondown-icon" />,
  ChevronUp: () => <div data-testid="chevronup-icon" />,
}))

// Mock external dependencies

describe("Select component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Select />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Select />
    )
    expect(container).toBeInTheDocument()
  })
})