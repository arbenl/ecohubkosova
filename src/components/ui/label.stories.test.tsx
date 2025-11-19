import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { meta } from "label.stories"

describe("meta component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <meta />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <meta />
    )
    expect(container).toBeInTheDocument()
  })
})