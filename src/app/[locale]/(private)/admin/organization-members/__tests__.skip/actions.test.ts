import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  requireAdminRole: vi.fn(),
  fetchAdminOrganizationMembers: vi.fn(),
  deleteOrganizationMemberRecord: vi.fn(),
  updateOrganizationMemberRecord: vi.fn(),
  toggleOrganizationMemberApprovalRecord: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/auth/roles", () => ({
  requireAdminRole: mocks.requireAdminRole,
}))

vi.mock("@/services/admin/organization-members", () => ({
  fetchAdminOrganizationMembers: mocks.fetchAdminOrganizationMembers,
  deleteOrganizationMemberRecord: mocks.deleteOrganizationMemberRecord,
  updateOrganizationMemberRecord: mocks.updateOrganizationMemberRecord,
  toggleOrganizationMemberApprovalRecord: mocks.toggleOrganizationMemberApprovalRecord,
}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}))

import {
  deleteOrganizationMember,
  getOrganizationMembers,
  toggleOrganizationMemberApproval,
  updateOrganizationMember,
} from "../actions"

describe("admin/organization-members actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminRole.mockResolvedValue({ user: { id: "admin" } })
  })

  it("returns members data", async () => {
    mocks.fetchAdminOrganizationMembers.mockResolvedValue({ data: [{ id: "m1" }], error: null })
    const result = await getOrganizationMembers()
    expect(result).toEqual({ data: [{ id: "m1" }], error: null })
  })

  it("deletes member", async () => {
    mocks.deleteOrganizationMemberRecord.mockResolvedValue({ error: null })
    const result = await deleteOrganizationMember("member-1")
    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.deleteOrganizationMemberRecord).toHaveBeenCalledWith("member-1")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/organization-members")
    expect(result).toEqual({ success: true })
  })

  it("validates member updates", async () => {
    const response = await updateOrganizationMember("member-1", {
      roli_ne_organizate: "",
      eshte_aprovuar: true,
    } as any)
    expect(response.error).toBeTruthy()
    expect(mocks.updateOrganizationMemberRecord).not.toHaveBeenCalled()
  })

  it("updates member", async () => {
    mocks.updateOrganizationMemberRecord.mockResolvedValue({ error: null })

    const result = await updateOrganizationMember("member-1", {
      roli_ne_organizate: "Menaxher",
      eshte_aprovuar: true,
    })

    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.updateOrganizationMemberRecord).toHaveBeenCalled()
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/organization-members")
    expect(result).toEqual({ success: true })
  })

  it("toggles approval", async () => {
    mocks.toggleOrganizationMemberApprovalRecord.mockResolvedValue({ error: null })
    const result = await toggleOrganizationMemberApproval("member-1", true)
    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.toggleOrganizationMemberApprovalRecord).toHaveBeenCalledWith("member-1", true)
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/organization-members")
    expect(result).toEqual({ success: true })
  })
})
