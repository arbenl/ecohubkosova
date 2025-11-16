import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { useIsMobile } from "../use-mobile"

describe("useIsMobile hook", () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    // Mock matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("max-width: 767px"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: originalInnerWidth,
    })
  })

  it("should initialize and return a boolean", () => {
    const { result } = renderHook(() => useIsMobile())
    expect(typeof result.current).toBe("boolean")
  })

  it("should return false for desktop screen widths", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it("should return true for mobile screen widths", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 500,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it("should work at the breakpoint boundary (768px)", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 768,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it("should work just below the breakpoint (767px)", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 767,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })
})
