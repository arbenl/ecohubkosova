import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { FormStatus } from "./form-status"

// Mock icons
vi.mock("lucide-react", () => ({
  AlertCircle: () => <div data-testid="alertcircle-icon" />,
  CheckCircle: () => <div data-testid="checkcircle-icon" />,
}))

describe("FormStatus component", () => {
  it("renders without crashing", () => {
    expect(() => render(<FormStatus />)).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(<FormStatus />)
    expect(container).toBeInTheDocument()
  })
})
