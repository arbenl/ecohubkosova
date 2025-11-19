import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Slider } from "./slider"

// Mock ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock external dependencies

describe("Slider component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Slider />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Slider />
    )
    expect(container).toBeInTheDocument()
  })
})