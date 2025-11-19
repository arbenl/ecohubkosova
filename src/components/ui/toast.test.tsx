import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Toast, ToastProvider } from "./toast"

// Mock icons
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon" />,
}))

// Mock external dependencies

describe("Toast component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <ToastProvider>
        <Toast />
      </ToastProvider>
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <ToastProvider>
        <Toast />
      </ToastProvider>
    )
    expect(container).toBeInTheDocument()
  })
})