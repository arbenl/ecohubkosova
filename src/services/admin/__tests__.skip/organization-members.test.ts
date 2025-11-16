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

  it("returns errors when fetch fails", async () => {
    chain.select.mockImplementationOnce(() => {
      throw new Error("offline")
    })

    const result = await fetchAdminOrganizationMembers()
    expect(result.data).toBeNull()
    expect(result.error?.message).toBe("offline")
  })
})
