import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LandingAuthPanelSkeleton } from "landing-auth-panel-skeleton"

describe("LandingAuthPanelSkeleton component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <LandingAuthPanelSkeleton />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <LandingAuthPanelSkeleton />
    )
    expect(container).toBeInTheDocument()
  })
})