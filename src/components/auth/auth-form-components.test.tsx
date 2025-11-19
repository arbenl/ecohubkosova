import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AuthAlert } from "auth-form-components"

describe("AuthAlert component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <AuthAlert />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <AuthAlert />
    )
    expect(container).toBeInTheDocument()
  })
})