import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Index } from "index"

describe("Index component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Index />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Index />
    )
    expect(container).toBeInTheDocument()
  })
})