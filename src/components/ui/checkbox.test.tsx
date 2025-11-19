import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Checkbox } from "./checkbox"

// Mock icons
vi.mock("lucide-react", () => ({
  Check: () => <div data-testid="check-icon" />,
}))

// Mock external dependencies

describe("Checkbox component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Checkbox />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Checkbox />
    )
    expect(container).toBeInTheDocument()
  })
})