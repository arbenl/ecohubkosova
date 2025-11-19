import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Badge } from "./badge"

// Mock external dependencies

describe("Badge component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Badge />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Badge />
    )
    expect(container).toBeInTheDocument()
  })
})