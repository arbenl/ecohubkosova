import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Pagination } from "./pagination"

// Mock icons
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevronleft-icon" />,
  ChevronRight: () => <div data-testid="chevronright-icon" />,
  MoreHorizontal: () => <div data-testid="morehorizontal-icon" />,
}))

// Mock external dependencies

describe("Pagination component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Pagination />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Pagination />
    )
    expect(container).toBeInTheDocument()
  })
})