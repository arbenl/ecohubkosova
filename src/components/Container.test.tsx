import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Container } from "./Container"

describe("Container component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Container />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Container />
    )
    expect(container).toBeInTheDocument()
  })

  it("renders children", () => {
    render(
      <Container>
        <div>Test content</div>
      </Container>
    )
    expect(screen.getByText("Test content")).toBeInTheDocument()
  })
})
})