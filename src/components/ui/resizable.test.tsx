import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ResizablePanelGroup } from "./resizable"

// Mock icons
vi.mock("lucide-react", () => ({
  GripVertical: () => <div data-testid="gripvertical-icon" />,
}))

// Mock external dependencies

describe("ResizablePanelGroup component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <ResizablePanelGroup />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <ResizablePanelGroup />
    )
    expect(container).toBeInTheDocument()
  })
})