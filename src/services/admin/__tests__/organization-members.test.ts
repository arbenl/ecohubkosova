import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  rows: [
    {
      member: {
        id: "member-1",
        organization_id: "org-1",
        user_id: "user-1",
        roli_ne_organizate: "Menaxher",
        eshte_aprovuar: true,
        created_at: new Date("2024-01-01"),
      },
      organization_name: "Org",
      user_name: "Jane",
      user_email: "jane@example.com",
    },
  ],
}))

const deleteWhere = vi.fn()
const updateWhere = vi.fn()

const chain: any = {
  select: vi.fn(() => chain),
  from: vi.fn(() => chain),
  innerJoin: vi.fn(() => chain),
  then: (resolve: (value: any) => any) => Promise.resolve(resolve(state.rows)),
}

const client = {
  select: chain.select,
  delete: vi.fn(() => ({ where: deleteWhere })),
  update: vi.fn(() => ({
    set: (payload: any) => {
      updateWhere.payload = payload
      return { where: updateWhere }
    },
  })),
}

vi.mock("@/lib/drizzle", () => ({
  db: {
    get: () => client,
  },
}))

const supabaseState = vi.hoisted(() => ({
  selectData: [] as any[],
  selectError: null as any,
}))

const createSupabaseBuilder = () => ({
  select: vi.fn(() => Promise.resolve({ data: supabaseState.selectData, error: supabaseState.selectError })),
  delete: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ error: null })),
  })),
  update: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ error: null })),
  })),
})

const supabase = vi.hoisted(() => ({
  from: vi.fn(() => createSupabaseBuilder()),
}))

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => supabase,
}))

const eqMock = vi.hoisted(() => vi.fn((_column: unknown, value: unknown) => ({ value })))
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<any>()
  return { ...actual, eq: eqMock }
})

import {
  deleteOrganizationMemberRecord,
  fetchAdminOrganizationMembers,
  toggleOrganizationMemberApprovalRecord,
  updateOrganizationMemberRecord,
} from "../organization-members"

describe("services/admin/organization-members", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockClear()
    supabaseState.selectData = []
    supabaseState.selectError = null
  })

  it("formats joined data", async () => {
    const result = await fetchAdminOrganizationMembers()
    expect(result.data?.[0]).toMatchObject({
      id: "member-1",
      organization_name: "Org",
      user_email: "jane@example.com",
    })
  })

  it("deletes a member", async () => {
    const result = await deleteOrganizationMemberRecord("member-1")
    expect(result.error).toBeNull()
    expect(deleteWhere).toHaveBeenCalled()
  })

  it("updates a member", async () => {
    const result = await updateOrganizationMemberRecord("member-1", {
      roli_ne_organizate: "Roli ri",
      eshte_aprovuar: false,
    })

    expect(result.error).toBeNull()
    expect(updateWhere.payload).toMatchObject({ roli_ne_organizate: "Roli ri", eshte_aprovuar: false })
  })

  it("toggles approval", async () => {
    const result = await toggleOrganizationMemberApprovalRecord("member-1", true)
    expect(result.error).toBeNull()
    expect(updateWhere.payload.eshte_aprovuar).toBe(false)
  })

  it("falls back to Supabase when Drizzle fetch fails", async () => {
    chain.select.mockImplementationOnce(() => {
      throw new Error("offline")
    })
    supabaseState.selectData = [
      {
        id: "member-fallback",
        organization_id: "org-2",
        user_id: "user-2",
        roli_ne_organizate: "Roli",
        eshte_aprovuar: true,
        created_at: "2024-01-01T00:00:00.000Z",
        organizations: { emri: "Org Fallback" },
        users: { emri_i_plote: "User", email: "user@example.com" },
      },
    ]

    const result = await fetchAdminOrganizationMembers()

    expect(supabase.from).toHaveBeenCalledWith("organization_members")
    expect(result.data?.[0].id).toBe("member-fallback")
  })
})
