import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Avatar } from "./avatar"

// Mock external dependencies

describe("Avatar component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Avatar />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Avatar />
    )
    expect(container).toBeInTheDocument()
  })
})