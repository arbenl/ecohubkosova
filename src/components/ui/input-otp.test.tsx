import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { InputOTP } from "./input-otp"

// Mock icons
vi.mock("lucide-react", () => ({
  Dot: () => <div data-testid="dot-icon" />,
}))

// Mock ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock external dependencies

describe("InputOTP component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <InputOTP />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <InputOTP />
    )
    expect(container).toBeInTheDocument()
  })
})