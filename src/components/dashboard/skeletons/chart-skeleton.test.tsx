import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ChartSkeleton } from "chart-skeleton"

describe("ChartSkeleton component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <ChartSkeleton />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <ChartSkeleton />
    )
    expect(container).toBeInTheDocument()
  })
})