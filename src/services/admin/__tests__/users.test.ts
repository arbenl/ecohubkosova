import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
  const selectFrom = vi.fn()
  const deleteWhere = vi.fn()
  const updateWhere = vi.fn()
  const state = { lastSetPayload: null as any }

  const client = {
    select: vi.fn(() => ({ from: selectFrom })),
    delete: vi.fn(() => ({ where: deleteWhere })),
    update: vi.fn(() => ({
      set: (payload: any) => {
        state.lastSetPayload = payload
        return { where: updateWhere }
      },
    })),
  }

  return {
    client,
    selectFrom,
    deleteWhere,
    updateWhere,
    state,
  }
})

vi.mock("@/lib/drizzle", () => ({
  db: {
    get: () => mocks.client,
  },
}))

const supabaseState = vi.hoisted(() => ({
  selectData: [] as any[],
  selectError: null as any,
  deleteError: null as any,
  updateError: null as any,
}))

const createSupabaseQueryBuilder = () => ({
  select: vi.fn(() => Promise.resolve({ data: supabaseState.selectData, error: supabaseState.selectError })),
  delete: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ error: supabaseState.deleteError })),
  })),
  update: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ error: supabaseState.updateError })),
  })),
})

const supabase = vi.hoisted(() => ({
  from: vi.fn(() => createSupabaseQueryBuilder()),
}))

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => supabase,
}))

const eqMock = vi.hoisted(() => vi.fn((_column: unknown, value: unknown) => ({ value })))
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    eq: eqMock,
  }
})

import { deleteUserRecord, fetchAdminUsers, updateUserRecord } from "../users"

describe("services/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state.lastSetPayload = null
    supabase.from.mockClear()
    supabaseState.selectData = []
    supabaseState.selectError = null
    supabaseState.deleteError = null
    supabaseState.updateError = null
    mocks.selectFrom.mockResolvedValue([
      {
        id: "1",
        emri_i_plote: "Jane",
        email: "jane@example.com",
        vendndodhja: "Prishtina",
        roli: "Admin",
        eshte_aprovuar: true,
        created_at: new Date("2024-01-01T00:00:00.000Z"),
        updated_at: null,
      },
    ])
    mocks.deleteWhere.mockResolvedValue(undefined)
    mocks.updateWhere.mockResolvedValue(undefined)
  })

  it("serializes admin users", async () => {
    const result = await fetchAdminUsers()

    expect(result.error).toBeNull()
    expect(result.data).toEqual([
      {
        id: "1",
        emri_i_plote: "Jane",
        email: "jane@example.com",
        vendndodhja: "Prishtina",
        roli: "Admin",
        eshte_aprovuar: true,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: null,
      },
    ])
  })

  it("deletes a user and builds where clause with eq", async () => {
    const response = await deleteUserRecord("user-1")

    expect(eqMock).toHaveBeenCalled()
    expect(eqMock.mock.calls[0][1]).toBe("user-1")
    expect(mocks.deleteWhere).toHaveBeenCalled()
    expect(response.error).toBeNull()
  })

  it("updates a user and adds updated_at", async () => {
    const payload = {
      emri_i_plote: "Jane",
      email: "jane@example.com",
      vendndodhja: "Prishtina",
      roli: "Admin",
      eshte_aprovuar: true,
    }

    const response = await updateUserRecord("user-2", payload)

    expect(eqMock.mock.calls.at(-1)?.[1]).toBe("user-2")
    expect(mocks.state.lastSetPayload).toMatchObject(payload)
    expect(mocks.state.lastSetPayload.updated_at).toBeInstanceOf(Date)
    expect(response.error).toBeNull()
  })

  it("falls back to Supabase when Drizzle fails to fetch users", async () => {
    mocks.selectFrom.mockRejectedValueOnce(new Error("offline"))
    supabaseState.selectData = [
      {
        id: "supabase-user",
        emri_i_plote: "Fallback",
        email: "fallback@example.com",
        vendndodhja: "",
        roli: "Admin",
        eshte_aprovuar: true,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: null,
      },
    ]

    const result = await fetchAdminUsers()

    expect(supabase.from).toHaveBeenCalledWith("users")
    expect(result.data?.[0].id).toBe("supabase-user")
  })

  it("falls back to Supabase when delete fails", async () => {
    mocks.deleteWhere.mockRejectedValueOnce(new Error("offline"))

    const response = await deleteUserRecord("user-3")

    expect(supabase.from).toHaveBeenCalledWith("users")
    expect(response.error).toBeNull()
  })

  it("falls back to Supabase when update fails", async () => {
    mocks.updateWhere.mockRejectedValueOnce(new Error("offline"))
    const payload = {
      emri_i_plote: "Fallback",
      email: "fallback@example.com",
      vendndodhja: "City",
      roli: "Admin",
      eshte_aprovuar: true,
    }

    const response = await updateUserRecord("user-4", payload)

    expect(supabase.from).toHaveBeenCalledWith("users")
    expect(response.error).toBeNull()
  })
})
