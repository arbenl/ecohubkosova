import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { StatsCards } from "stats-cards"

// Mock hooks
vi.mock("@/hooks/use-dashboard-stats", () => ({
  useDashboardStats: vi.fn()
}))

describe("StatsCards component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <StatsCards />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <StatsCards />
    )
    expect(container).toBeInTheDocument()
  })
})