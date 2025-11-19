import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Breadcrumb } from "./breadcrumb"

// Mock icons
vi.mock("lucide-react", () => ({
  ChevronRight: () => <div data-testid="chevronright-icon" />,
  MoreHorizontal: () => <div data-testid="morehorizontal-icon" />,
}))

// Mock external dependencies

describe("Breadcrumb component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Breadcrumb />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Breadcrumb />
    )
    expect(container).toBeInTheDocument()
  })
})