import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  requireAdminRole: vi.fn(),
  fetchAdminUsers: vi.fn(),
  deleteUserRecord: vi.fn(),
  updateUserRecord: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/auth/roles", () => ({
  requireAdminRole: mocks.requireAdminRole,
}))

vi.mock("@/services/admin/users", () => ({
  fetchAdminUsers: mocks.fetchAdminUsers,
  deleteUserRecord: mocks.deleteUserRecord,
  updateUserRecord: mocks.updateUserRecord,
}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}))

import { deleteUser, getUsers, updateUser } from "../actions"

describe("admin/users actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns data from fetchAdminUsers", async () => {
    mocks.fetchAdminUsers.mockResolvedValue({ data: [{ id: "1" }], error: null })

    const result = await getUsers()

    expect(result).toEqual({ data: [{ id: "1" }], error: null })
  })

  it("handles fetch errors", async () => {
    const err = new Error("boom")
    mocks.fetchAdminUsers.mockResolvedValue({ data: null, error: err })

    const result = await getUsers()

    expect(result.error).toBe("boom")
  })

  it("requires admin role before deleting and revalidates on success", async () => {
    mocks.deleteUserRecord.mockResolvedValue({ error: null })

    const response = await deleteUser("user-id")

    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.deleteUserRecord).toHaveBeenCalledWith("user-id")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/users")
    expect(response).toEqual({ success: true })
  })

  it("short-circuits update on validation errors", async () => {
    const response = await updateUser(
      "user-id",
      { emri_i_plote: "", vendndodhja: "", roli: "Admin", eshte_aprovuar: true, email: "bad" } as any
    )

    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(response.error).toBeTruthy()
    expect(mocks.updateUserRecord).not.toHaveBeenCalled()
  })

  it("updates a user and revalidates when payload is valid", async () => {
    mocks.updateUserRecord.mockResolvedValue({ error: null })

    const response = await updateUser("user-id", {
      emri_i_plote: "Jane",
      email: "jane@example.com",
      vendndodhja: "Prishtina",
      roli: "Admin",
      eshte_aprovuar: true,
    })

    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.updateUserRecord).toHaveBeenCalledWith("user-id", {
      emri_i_plote: "Jane",
      email: "jane@example.com",
      vendndodhja: "Prishtina",
      roli: "Admin",
      eshte_aprovuar: true,
    })
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/users")
    expect(response).toEqual({ success: true })
  })
})
