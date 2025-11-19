import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Drawer } from "./drawer"

// Mock external dependencies

describe("Drawer component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Drawer />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Drawer />
    )
    expect(container).toBeInTheDocument()
  })
})