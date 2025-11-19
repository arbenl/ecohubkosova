import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AspectRatio } from "./aspect-ratio"

describe("AspectRatio component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <AspectRatio />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <AspectRatio />
    )
    expect(container).toBeInTheDocument()
  })
})