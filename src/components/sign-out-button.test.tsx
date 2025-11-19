import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SignOutButton } from "sign-out-button"

// Mock icons
vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader2-icon" />,
}))

// Mock external dependencies

describe("SignOutButton component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <SignOutButton />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <SignOutButton />
    )
    expect(container).toBeInTheDocument()
  })
})