import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OrganizationProfileForm } from "org-profile-form"

// Mock hooks
vi.mock("@/hooks/use-profile-forms", () => ({
  useProfileForms: vi.fn()
}))

describe("OrganizationProfileForm component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <OrganizationProfileForm />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <OrganizationProfileForm />
    )
    expect(container).toBeInTheDocument()
  })
})