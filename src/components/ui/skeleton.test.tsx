import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Skeleton } from "./skeleton"

describe("Skeleton component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Skeleton />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Skeleton />
    )
    expect(container).toBeInTheDocument()
  })
})