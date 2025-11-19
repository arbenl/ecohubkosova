import React from "react"
import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useIsMobile } from "./use-mobile"

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
  })),
})

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024, // Desktop width
})

// Test component that uses the hook
function TestComponent() {
  const isMobile = useIsMobile()
  return <div>{isMobile ? 'mobile' : 'desktop'}</div>
}

describe("useIsMobile hook", () => {
  it("returns false for desktop width", () => {
    const { getByText } = render(<TestComponent />)
    expect(getByText('desktop')).toBeInTheDocument()
  })

  it("returns true for mobile width", () => {
    // Change window width to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 500,
    })

    const { getByText } = render(<TestComponent />)
    expect(getByText('mobile')).toBeInTheDocument()
  })
})