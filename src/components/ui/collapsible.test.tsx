import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Collapsible } from "./collapsible"

describe("Collapsible component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Collapsible />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Collapsible />
    )
    expect(container).toBeInTheDocument()
  })
})