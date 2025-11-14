import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
  const state = {
    listResponse: { data: [], error: null as any },
    detailResponse: { data: null, error: null as any },
  }

  const builder: any = {
    eq: vi.fn(() => builder),
    ilike: vi.fn(() => builder),
    order: vi.fn(() => builder),
    range: vi.fn(() => builder),
    select: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(state.detailResponse)),
    then: (resolve: (value: any) => any) => Promise.resolve(resolve(state.listResponse)),
  }

  const supabase = {
    from: vi.fn(() => builder),
  }

  return { state, builder, supabase }
})

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => mocks.supabase,
}))

vi.mock("next/cache", () => ({
  unstable_noStore: () => () => {},
}))

import { fetchListings, fetchListingById } from "../listings"

describe("services/listings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state.listResponse = { data: [{ id: "1" }], error: null }
    mocks.state.detailResponse = { data: { id: "detail-1" }, error: null }
  })

  it("applies all filters when fetching listings", async () => {
    const result = await fetchListings({
      type: "shes",
      search: "energi",
      category: "Energjia",
      page: 2,
      condition: "e re",
      location: "Prishtina",
      sort: "oldest",
    })

    expect(mocks.supabase.from).toHaveBeenCalledWith("tregu_listime")
    expect(mocks.builder.select).toHaveBeenCalled()
    expect(mocks.builder.order).toHaveBeenCalledWith("created_at", { ascending: true })
    expect(mocks.builder.range).toHaveBeenCalledWith(9, 17)
    expect(mocks.builder.eq).toHaveBeenCalledWith("lloji_listimit", "shes")
    expect(mocks.builder.ilike).toHaveBeenCalledWith("titulli", "%energi%")
    expect(result).toEqual({ data: [{ id: "1" }], hasMore: false, error: null })
  })

  it("returns fallback when supabase errors", async () => {
    mocks.state.listResponse = { data: null, error: new Error("boom") }

    const result = await fetchListings({})

    expect(result.data).toEqual([])
    expect(result.hasMore).toBe(false)
    expect(result.error).toBe("boom")
  })

  it("fetches listing by id and handles errors", async () => {
    mocks.state.detailResponse = {
      data: {
        id: "detail-1",
        users: null,
        organizations: null,
      },
      error: null,
    }

    const success = await fetchListingById("abc")
    expect(success.data).toEqual({ id: "detail-1", users: null, organizations: null })
    expect(success.error).toBeNull()
    expect(mocks.builder.single).toHaveBeenCalled()

    mocks.state.detailResponse = { data: null, error: new Error("missing") }
    const failure = await fetchListingById("missing")
    expect(failure.data).toBeNull()
    expect(failure.error).toBe("missing")
  })
})
