import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { UserProfileForm } from "user-profile-form"

// Mock hooks
vi.mock("@/hooks/use-profile-forms", () => ({
  useProfileForms: vi.fn()
}))

describe("UserProfileForm component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <UserProfileForm />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <UserProfileForm />
    )
    expect(container).toBeInTheDocument()
  })
})