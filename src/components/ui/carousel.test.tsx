import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Carousel } from "./carousel"

// Mock icons
vi.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrowleft-icon" />,
  ArrowRight: () => <div data-testid="arrowright-icon" />,
}))

// Mock external dependencies

describe("Carousel component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Carousel />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Carousel />
    )
    expect(container).toBeInTheDocument()
  })
})