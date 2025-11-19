import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Textarea } from "./textarea"

// Mock external dependencies

describe("Textarea component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Textarea />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Textarea />
    )
    expect(container).toBeInTheDocument()
  })
})