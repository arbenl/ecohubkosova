import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Header } from "header"

describe("Header component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Header />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Header />
    )
    expect(container).toBeInTheDocument()
  })
})