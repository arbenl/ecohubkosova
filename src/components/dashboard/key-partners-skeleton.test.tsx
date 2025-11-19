import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { KeyPartnersSkeleton } from "key-partners-skeleton"

describe("KeyPartnersSkeleton component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <KeyPartnersSkeleton />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <KeyPartnersSkeleton />
    )
    expect(container).toBeInTheDocument()
  })
})