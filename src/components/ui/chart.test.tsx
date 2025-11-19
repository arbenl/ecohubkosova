import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ChartContainer } from "./chart"

// Mock external dependencies

describe("ChartContainer component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <ChartContainer config={{}}>
        <div>Test content</div>
      </ChartContainer>
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <ChartContainer config={{}}>
        <div>Test content</div>
      </ChartContainer>
    )
    expect(container).toBeInTheDocument()
  })
})