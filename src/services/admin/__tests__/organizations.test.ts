import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  rows: [
    {
      id: "org-1",
      emri: "Org",
      pershkrimi: "Pershkrim",
      interesi_primar: "Interes",
      person_kontakti: "Jane",
      email_kontakti: "jane@example.com",
      vendndodhja: "Prishtina",
      lloji: "OJQ",
      eshte_aprovuar: true,
      created_at: new Date("2024-01-01"),
      updated_at: null,
    },
  ],
}))

const deleteWhere = vi.fn()
const updateWhere = vi.fn()

const client = {
  select: vi.fn(() => ({ from: vi.fn(() => Promise.resolve(state.rows)) })),
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

import { deleteOrganizationRecord, fetchAdminOrganizations, updateOrganizationRecord } from "../organizations"

describe("services/admin/organizations", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    supabase.from.mockClear()
    supabaseState.selectData = []
    supabaseState.selectError = null
  })

  it("serializes data", async () => {
    const result = await fetchAdminOrganizations()
    expect(result.data?.[0].created_at).toBe("2024-01-01T00:00:00.000Z")
  })

  it("deletes organization", async () => {
    const result = await deleteOrganizationRecord("org-1")
    expect(result.error).toBeNull()
    expect(eqMock).toHaveBeenCalled()
    expect(deleteWhere).toHaveBeenCalled()
  })

  it("updates organization with timestamp", async () => {
    const payload = state.rows[0]
    const result = await updateOrganizationRecord("org-1", payload)
    expect(result.error).toBeNull()
    expect(updateWhere.payload.updated_at).toBeInstanceOf(Date)
  })

  it("falls back to Supabase when Drizzle fetch fails", async () => {
    client.select.mockReturnValueOnce({ from: () => Promise.reject(new Error("offline")) })
    supabaseState.selectData = [
      {
        id: "org-fallback",
        emri: "Fallback",
        pershkrimi: "",
        interesi_primar: "",
        person_kontakti: "",
        email_kontakti: "",
        vendndodhja: "",
        lloji: "OJQ",
        eshte_aprovuar: true,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: null,
      },
    ]

    const result = await fetchAdminOrganizations()

    expect(supabase.from).toHaveBeenCalledWith("organizations")
    expect(result.data?.[0].id).toBe("org-fallback")
  })
})
