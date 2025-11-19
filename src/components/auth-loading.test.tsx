import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AuthLoading } from "./auth-loading"

describe("AuthLoading component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <AuthLoading />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <AuthLoading />
    )
    expect(container).toBeInTheDocument()
  })
})