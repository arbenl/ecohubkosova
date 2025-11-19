import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { DashboardChartCard } from "dashboard-chart-card"

// Mock hooks
vi.mock("@/hooks/use-dashboard-filters", () => ({
  useDashboardFilters: vi.fn()
}))

describe("DashboardChartCard component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <DashboardChartCard />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <DashboardChartCard />
    )
    expect(container).toBeInTheDocument()
  })
})