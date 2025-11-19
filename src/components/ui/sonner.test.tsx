import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Toaster } from "./sonner"

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock external dependencies

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