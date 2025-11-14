import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  rows: [
    {
      id: "1",
      created_by_user_id: "user-1",
      organization_id: null,
      titulli: "Listim",
      pershkrimi: "Përshkrim",
      kategori: "Kategori",
      cmimi: "25" as unknown as number,
      njesia: "kg",
      vendndodhja: "Prishtina",
      sasia: "10",
      lloji_listimit: "shes",
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

const eqMock = vi.hoisted(() => vi.fn((_column: unknown, value: unknown) => ({ value })))
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<any>()
  return { ...actual, eq: eqMock }
})

import { deleteListingRecord, fetchAdminListings, updateListingRecord } from "../listings"

describe("services/admin/listings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("serializes listings data", async () => {
    const result = await fetchAdminListings()
    expect(result.data?.[0].cmimi).toBe(25)
    expect(result.data?.[0].created_at).toBe("2024-01-01T00:00:00.000Z")
  })

  it("deletes a listing", async () => {
    const result = await deleteListingRecord("listing-1")
    expect(eqMock).toHaveBeenCalled()
    expect(deleteWhere).toHaveBeenCalled()
    expect(result.error).toBeNull()
  })

  it("updates a listing and stores updated_at", async () => {
    const payload = {
      titulli: "Listim",
      pershkrimi: "Përshkrim",
      kategori: "Kategori",
      cmimi: 10,
      njesia: "kg",
      vendndodhja: "Prishtina",
      sasia: "10",
      lloji_listimit: "shes",
      eshte_aprovuar: true,
    }

    const result = await updateListingRecord("listing-1", payload)
    expect(result.error).toBeNull()
    expect(updateWhere).toHaveBeenCalled()
    expect(updateWhere.payload).toMatchObject({ ...payload, cmimi: "10" })
    expect(updateWhere.payload.updated_at).toBeInstanceOf(Date)
  })
})
