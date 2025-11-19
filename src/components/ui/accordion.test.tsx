import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Accordion } from "./accordion"

// Mock icons
vi.mock("lucide-react", () => ({
  ChevronDown: () => <div data-testid="chevrondown-icon" />,
}))

// Mock external dependencies

describe("Accordion component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Accordion />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Accordion />
    )
    expect(container).toBeInTheDocument()
  })
})