import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Toaster } from "./toaster"

// Mock hooks
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toasts: [],
    toast: vi.fn(),
    dismiss: vi.fn(),
  }),
}))

describe("Toaster component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Toaster />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Toaster />
    )
    expect(container).toBeInTheDocument()
  })
})