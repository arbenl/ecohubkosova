import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProfileLoader } from "profile-loader"

// Mock external dependencies

describe("ProfileLoader component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <ProfileLoader />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <ProfileLoader />
    )
    expect(container).toBeInTheDocument()
  })
})