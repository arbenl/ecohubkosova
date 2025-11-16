import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  requireAdminRole: vi.fn(),
  fetchAdminOrganizations: vi.fn(),
  deleteOrganizationRecord: vi.fn(),
  updateOrganizationRecord: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/auth/roles", () => ({
  requireAdminRole: mocks.requireAdminRole,
}))

vi.mock("@/services/admin/organizations", () => ({
  fetchAdminOrganizations: mocks.fetchAdminOrganizations,
  deleteOrganizationRecord: mocks.deleteOrganizationRecord,
  updateOrganizationRecord: mocks.updateOrganizationRecord,
}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}))

import { deleteOrganization, getOrganizations, updateOrganization } from "../actions"

describe("admin/organizations actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminRole.mockResolvedValue({ user: { id: "admin" } })
  })

  it("returns organization data", async () => {
    mocks.fetchAdminOrganizations.mockResolvedValue({ data: [{ id: "org-1" }], error: null })
    const result = await getOrganizations()
    expect(result).toEqual({ data: [{ id: "org-1" }], error: null })
  })

  it("handles fetch errors", async () => {
    const err = new Error("boom")
    mocks.fetchAdminOrganizations.mockResolvedValue({ data: null, error: err })
    const result = await getOrganizations()
    expect(result.error).toBe("boom")
  })

  it("deletes an organization", async () => {
    mocks.deleteOrganizationRecord.mockResolvedValue({ error: null })
    const result = await deleteOrganization("org-1")
    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.deleteOrganizationRecord).toHaveBeenCalledWith("org-1")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/organizations")
    expect(result).toEqual({ success: true })
  })

  it("rejects invalid payloads", async () => {
    const response = await updateOrganization("org-1", {
      emri: "",
      pershkrimi: "",
      interesi_primar: "",
      person_kontakti: "",
      email_kontakti: "invalid",
      vendndodhja: "",
      lloji: "OJQ",
      eshte_aprovuar: true,
    } as any)

    expect(response.error).toBeTruthy()
    expect(mocks.updateOrganizationRecord).not.toHaveBeenCalled()
  })

  it("updates organization and revalidates", async () => {
    mocks.updateOrganizationRecord.mockResolvedValue({ error: null })
    const result = await updateOrganization("org-1", {
      emri: "Org",
      pershkrimi: "Ky është një pershkrim i gjatë i organizatës.",
      interesi_primar: "Interes",
      person_kontakti: "Jane",
      email_kontakti: "jane@example.com",
      vendndodhja: "Prishtina",
      lloji: "OJQ",
      eshte_aprovuar: true,
    })

    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.updateOrganizationRecord).toHaveBeenCalled()
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/organizations")
    expect(result).toEqual({ success: true })
  })
})
