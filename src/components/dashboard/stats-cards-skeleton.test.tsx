import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { StatsCardsSkeleton } from "stats-cards-skeleton"

describe("StatsCardsSkeleton component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <StatsCardsSkeleton />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <StatsCardsSkeleton />
    )
    expect(container).toBeInTheDocument()
  })
})