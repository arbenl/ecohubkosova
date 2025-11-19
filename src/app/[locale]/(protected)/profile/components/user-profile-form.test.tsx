import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { UserProfileForm } from "./user-profile-form"

// Mock hooks
vi.mock("@/hooks/use-profile-forms", () => ({
  useUserProfileForm: vi.fn(() => ({
    formData: { fullName: "", email: "", location: "" },
    fieldErrors: {},
    saving: false,
    error: null,
    success: false,
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
  })),
}))

vi.mock("../actions", () => ({
  updateUserProfile: vi.fn(),
}))

describe("UserProfileForm component", () => {
  const mockProps = {
    initialFullName: "John Doe",
    initialEmail: "john@example.com",
    initialLocation: "Prishtina",
  }

  it("renders without crashing", () => {
    expect(() => render(
      <UserProfileForm {...mockProps} />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <UserProfileForm {...mockProps} />
    )
    expect(container).toBeInTheDocument()
  })
})