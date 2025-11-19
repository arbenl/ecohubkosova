import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Dialog } from "./dialog"

// Mock icons
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon" />,
}))

// Mock external dependencies

describe("Dialog component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Dialog />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Dialog />
    )
    expect(container).toBeInTheDocument()
  })
})