import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Heading } from "./Heading"

describe("Heading component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Heading title="Test Title" />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Heading title="Test Title" />
    )
    expect(container).toBeInTheDocument()
  })

  it("renders title", () => {
    render(<Heading title="Test Title" />)
    expect(screen.getByText("Test Title")).toBeInTheDocument()
  })

  it("renders subtitle when provided", () => {
    render(<Heading title="Test Title" subtitle="Test Subtitle" />)
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument()
  })
})
})