import { beforeEach, describe, expect, it, vi } from "vitest"

const ITEM = {
  id: "listing-1",
  created_by_user_id: "user-1",
  organization_id: null,
  titulli: "Panele diellore",
  pershkrimi: "Përdoren për energji të ripërtëritshme",
  kategori: "Energji",
  cmimi: "1500.00",
  njesia: "set",
  vendndodhja: "Prishtina",
  sasia: "10",
  lloji_listimit: "shes",
  eshte_aprovuar: true,
  created_at: new Date("2024-01-01T00:00:00.000Z"),
  updated_at: new Date("2024-01-02T00:00:00.000Z"),
} as const

const mocks = vi.hoisted(() => {
  const state = {
    listRows: [] as any[],
    detailRows: [] as any[],
    listError: null as Error | null,
    detailError: null as Error | null,
  }

  const buildQuery = () => {
    const builder: any = {
      select: vi.fn(() => builder),
      from: vi.fn(() => builder),
      leftJoin: vi.fn(() => builder),
      where: vi.fn(() => builder),
      orderBy: vi.fn(() => builder),
      limit: vi.fn((value: number) => {
        builder._limit = value
        if (value > 1) {
          return builder
        }
        return state.detailError ? Promise.reject(state.detailError) : Promise.resolve(state.detailRows)
      }),
      offset: vi.fn(() => (state.listError ? Promise.reject(state.listError) : Promise.resolve(state.listRows))),
    }
    return builder
  }

  const get = vi.fn(() => buildQuery())

  return { state, get }
})

vi.mock("@/lib/drizzle", () => ({
  db: {
    get: () => mocks.get(),
  },
}))

vi.mock("next/cache", () => ({
  unstable_noStore: () => () => {},
}))

import { fetchListingById, fetchListings } from "../listings"

const makeRow = (overrides: Partial<typeof ITEM> = {}) => ({
  listing: { ...ITEM, ...overrides },
  owner_name: "Admin",
  owner_email: "admin@example.com",
  organization_name: null,
  organization_email: null,
  condition: "e re",
})

describe("services/listings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state.listRows = [makeRow()]
    mocks.state.detailRows = [makeRow()]
    mocks.state.listError = null
    mocks.state.detailError = null
  })

  it("returns mapped listings with pagination metadata", async () => {
    const result = await fetchListings({
      type: "shes",
      search: "energi",
      category: "Energji",
      page: 2,
      condition: "e re",
      location: "Prishtina",
      sort: "oldest",
    })

    expect(result.error).toBeNull()
    expect(result.hasMore).toBe(false)
    expect(result.data[0]).toMatchObject({
      id: ITEM.id,
      titulli: ITEM.titulli,
      cmimi: Number(ITEM.cmimi),
      users: { emri_i_plote: "Admin", email: "admin@example.com" },
      gjendja: "e re",
    })
  })

  it("returns fallback when the query fails", async () => {
    const boom = new Error("boom")
    mocks.state.listError = boom

    const result = await fetchListings({})

    expect(result.data).toEqual([])
    expect(result.hasMore).toBe(false)
    expect(result.error).toBe("boom")
  })

  it("fetches a single listing and reports missing entries", async () => {
    const success = await fetchListingById("listing-1")
    expect(success.data?.id).toBe(ITEM.id)

    mocks.state.detailRows = []
    const failure = await fetchListingById("missing")
    expect(failure.data).toBeNull()
    expect(failure.error).toMatch(/nuk u gjet/i)
  })
})
