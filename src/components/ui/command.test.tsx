import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Command } from "./command"

// Mock icons
vi.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon" />,
}))

// Mock external dependencies

describe("Command component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Command />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Command />
    )
    expect(container).toBeInTheDocument()
  })
})