import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OrganizationProfileForm } from "./org-profile-form"

// Mock external dependencies
vi.mock("@/hooks/use-profile-forms", () => ({
  useOrganizationProfileForm: vi.fn(() => ({
    formData: { name: "", description: "" },
    fieldErrors: {},
    saving: false,
    error: null,
    success: false,
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
  })),
}))

vi.mock("../actions", () => ({
  updateOrganizationProfile: vi.fn(),
}))

describe("OrganizationProfileForm component", () => {
  const mockProps = {
    organizationId: "123",
    initialData: {
      name: "Test Org",
      description: "Test description",
    },
  }

  it("renders without crashing", () => {
    expect(() => render(
      <OrganizationProfileForm {...mockProps} />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <OrganizationProfileForm {...mockProps} />
    )
    expect(container).toBeInTheDocument()
  })
})