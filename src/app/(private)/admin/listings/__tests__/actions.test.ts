import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  requireAdminRole: vi.fn(),
  fetchAdminListings: vi.fn(),
  deleteListingRecord: vi.fn(),
  updateListingRecord: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/auth/roles", () => ({
  requireAdminRole: mocks.requireAdminRole,
}))

vi.mock("@/services/admin/listings", () => ({
  fetchAdminListings: mocks.fetchAdminListings,
  deleteListingRecord: mocks.deleteListingRecord,
  updateListingRecord: mocks.updateListingRecord,
}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}))

import { deleteListing, getListings, updateListing } from "../actions"

describe("admin/listings actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminRole.mockResolvedValue({ user: { id: "admin" } })
  })

  it("returns listings data", async () => {
    mocks.fetchAdminListings.mockResolvedValue({ data: [{ id: "1" }], error: null })

    const result = await getListings()
    expect(result).toEqual({ data: [{ id: "1" }], error: null })
  })

  it("handles fetch error", async () => {
    const err = new Error("boom")
    mocks.fetchAdminListings.mockResolvedValue({ data: null, error: err })

    const result = await getListings()
    expect(result.error).toBe("boom")
  })

  it("deletes a listing", async () => {
    mocks.deleteListingRecord.mockResolvedValue({ error: null })

    const result = await deleteListing("listing-1")

    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.deleteListingRecord).toHaveBeenCalledWith("listing-1")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/listings")
    expect(result).toEqual({ success: true })
  })

  it("validates listing update payload", async () => {
    const response = await updateListing("listing-1", {
      titulli: "",
      pershkrimi: "",
      kategori: "",
      cmimi: -1,
      njesia: "",
      vendndodhja: "",
      sasia: "",
      lloji_listimit: "shes",
      eshte_aprovuar: true,
    } as any)

    expect(mocks.updateListingRecord).not.toHaveBeenCalled()
    expect(response.error).toBeTruthy()
  })

  it("updates listing and revalidates", async () => {
    mocks.updateListingRecord.mockResolvedValue({ error: null })

    const response = await updateListing("listing-1", {
      titulli: "Listim",
      pershkrimi: "Përshkrim i vlefshëm",
      kategori: "Kategori",
      cmimi: 10,
      njesia: "kg",
      vendndodhja: "Prishtina",
      sasia: "100",
      lloji_listimit: "shes",
      eshte_aprovuar: true,
    })

    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.updateListingRecord).toHaveBeenCalled()
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/listings")
    expect(response).toEqual({ success: true })
  })
})
