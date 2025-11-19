import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Sheet } from "./sheet"

// Mock icons
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon" />,
}))

// Mock external dependencies

describe("Sheet component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Sheet />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Sheet />
    )
    expect(container).toBeInTheDocument()
  })
})