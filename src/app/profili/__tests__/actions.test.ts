import { describe, beforeEach, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
  const mockAuthGetUser = vi.fn()
  const mockSupabaseClient = {
    auth: {
      getUser: mockAuthGetUser,
    },
  }

  return {
    mockAuthGetUser,
    mockSupabaseClient,
    mockCreateSupabaseClient: vi.fn(() => mockSupabaseClient),
    mockUpdateUserProfileRecord: vi.fn(),
    mockUpdateOrganizationRecord: vi.fn(),
    mockEnsureOrganizationMembership: vi.fn(),
    mockRevalidatePath: vi.fn(),
    mockRedirect: vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`)
    }),
  }
})

vi.mock("@/lib/supabase/server", () => ({
  createRouteHandlerSupabaseClient: mocks.mockCreateSupabaseClient,
}))

vi.mock("@/services/profile", () => ({
  ensureUserOrganizationMembership: mocks.mockEnsureOrganizationMembership,
  fetchCurrentUserProfile: vi.fn(),
  updateOrganizationRecord: mocks.mockUpdateOrganizationRecord,
  updateUserProfileRecord: mocks.mockUpdateUserProfileRecord,
}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.mockRevalidatePath,
}))

vi.mock("next/navigation", () => ({
  redirect: mocks.mockRedirect,
}))

import { updateOrganizationProfile, updateUserProfile } from "../actions"

describe("profile actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.mockAuthGetUser.mockResolvedValue({ data: { user: { id: "user-123" } } })
  })

  describe("updateUserProfile", () => {
    it("updates the user profile when data is valid", async () => {
      mocks.mockUpdateUserProfileRecord.mockResolvedValue({ error: null })

      const result = await updateUserProfile({ emri_i_plote: "John Doe", vendndodhja: "Prishtina" })

      expect(mocks.mockCreateSupabaseClient).toHaveBeenCalled()
      expect(mocks.mockUpdateUserProfileRecord).toHaveBeenCalledWith("user-123", {
        emri_i_plote: "John Doe",
        vendndodhja: "Prishtina",
      })
      expect(mocks.mockRevalidatePath).toHaveBeenCalledWith("/profili")
      expect(result).toEqual({ success: true })
    })

    it("returns validation error when payload is invalid", async () => {
      const result = await updateUserProfile({ emri_i_plote: "", vendndodhja: "" })

      expect(result.error).toBeTruthy()
      expect(mocks.mockUpdateUserProfileRecord).not.toHaveBeenCalled()
    })

    it("redirects when no authenticated user is present", async () => {
      mocks.mockAuthGetUser.mockResolvedValueOnce({ data: { user: null } })

      await expect(updateUserProfile({ emri_i_plote: "John", vendndodhja: "City" })).rejects.toThrow(
        /REDIRECT:\/auth\/kycu/
      )
    })
  })

  describe("updateOrganizationProfile", () => {
    const organizationId = "org-1"
    const payload = {
      emri: "Org",
      pershkrimi: "Përshkrim i mjaftueshëm",
      interesi_primar: "Green",
      person_kontakti: "Jane",
      email_kontakti: "jane@example.com",
      vendndodhja: "Prishtina",
    }

    it("rejects updates when the user is not a member", async () => {
      mocks.mockEnsureOrganizationMembership.mockResolvedValue({ isMember: false, error: null })

      const result = await updateOrganizationProfile(organizationId, payload)

      expect(result.error).toBe("Nuk jeni i autorizuar të përditësoni këtë organizatë.")
      expect(mocks.mockUpdateOrganizationRecord).not.toHaveBeenCalled()
    })

    it("propagates service errors", async () => {
      mocks.mockEnsureOrganizationMembership.mockResolvedValue({ isMember: false, error: new Error("boom") })

      const result = await updateOrganizationProfile(organizationId, payload)

      expect(result.error).toBe("Gabim gjatë verifikimit të autorizimit të organizatës.")
    })

    it("updates the organization when authorized", async () => {
      mocks.mockEnsureOrganizationMembership.mockResolvedValue({ isMember: true, error: null })
      mocks.mockUpdateOrganizationRecord.mockResolvedValue({ error: null })

      const result = await updateOrganizationProfile(organizationId, payload)

      expect(mocks.mockEnsureOrganizationMembership).toHaveBeenCalledWith(organizationId, "user-123")
      expect(mocks.mockUpdateOrganizationRecord).toHaveBeenCalledWith(organizationId, payload)
      expect(mocks.mockRevalidatePath).toHaveBeenCalledWith("/profili")
      expect(result).toEqual({ success: true })
    })
  })
})
