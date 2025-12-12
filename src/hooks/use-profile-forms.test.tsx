import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useUserProfileForm, useOrganizationProfileForm } from "./use-profile-forms"

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

describe("useUserProfileForm hook", () => {
  it("returns expected values", () => {
    const mockSubmit = vi.fn().mockResolvedValue({})

    const { result } = renderHook(() =>
      useUserProfileForm({
        initialFullName: "John Doe",
        initialLocation: "Prishtina",
        submit: mockSubmit,
      })
    )

    expect(result.current.formData.full_name).toBe("John Doe")
    expect(result.current.formData.location).toBe("Prishtina")
  })
})

describe("useOrganizationProfileForm hook", () => {
  it("returns expected values", () => {
    const mockSubmit = vi.fn().mockResolvedValue({})

    const { result } = renderHook(() =>
      useOrganizationProfileForm({
        organizationId: "org-1",
        initialData: {
          name: "Test Organization",
          description: "Test description that is long enough",
          primary_interest: "Recycling",
          contact_person: "Alice",
          contact_email: "a@test.com",
          location: "Prishtina",
        },
        submit: mockSubmit,
      })
    )

    expect(result.current.formData.name).toBe("Test Organization")
    expect(result.current.formData.contact_person).toBe("Alice")
  })
})
