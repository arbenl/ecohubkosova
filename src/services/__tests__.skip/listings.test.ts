import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(() => {}),
}))

// NOW import the service - mocks from setup.ts are already in place
import { fetchListingById, fetchListings, createUserListing, updateUserListing, deleteUserListing } from "../listings"

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
  })

  describe("fetchListings", () => {
    it("executes query without database errors", async () => {
      const result = await fetchListings({
        type: "shes",
        search: "energi",
        category: "Energji",
        page: 2,
        condition: "e re",
        location: "Prishtina",
        sort: "oldest",
      })

      // With mock returning [], results should be empty but no database errors
      expect(result.data).toEqual([])
      expect(result.hasMore).toBe(false)
      expect(result.error).toBeNull()
    })

    it("handles empty results gracefully", async () => {
      const result = await fetchListings({})

      expect(result.data).toEqual([])
      expect(result.hasMore).toBe(false)
      expect(result.error).toBeNull()
    })
  })

  describe("fetchListingById", () => {
    it("handles missing entries", async () => {
      const failure = await fetchListingById("missing")
      expect(failure.data).toBeNull()
      expect(failure.error).toMatch(/nuk u gjet/i)
    })
  })

  describe("createUserListing", () => {
    it("validates price input before creating", async () => {
      const result = await createUserListing("user-1", {
        titulli: "Test",
        pershkrimi: "Test",
        kategori: "Test",
        cmimi: NaN,
        njesia: "set",
        vendndodhja: "Prishtina",
        sasia: "10",
        lloji_listimit: "shes",
      })

      expect(result).toHaveProperty("error")
      expect(result.error).toMatch(/çmimi/i)
    })

    it("creates a listing successfully with valid data", async () => {
      const result = await createUserListing("user-1", {
        titulli: "Panele diellore",
        pershkrimi: "Përdoren për energji",
        kategori: "Energji",
        cmimi: 1500,
        njesia: "set",
        vendndodhja: "Prishtina",
        sasia: "5",
        lloji_listimit: "shes",
      })

      expect(result).toHaveProperty("success", true)
    })
  })

  describe("updateUserListing", () => {
    it("validates price input before updating", async () => {
      const result = await updateUserListing("listing-1", "user-1", {
        titulli: "Updated",
        pershkrimi: "Updated",
        kategori: "Test",
        cmimi: NaN,
        njesia: "set",
        vendndodhja: "Prishtina",
        sasia: "5",
        lloji_listimit: "shes",
      })

      expect(result).toHaveProperty("error")
    })
  })

  describe("deleteUserListing", () => {
    it("returns error when listing not found", async () => {
      const result = await deleteUserListing("missing", "user-1")

      expect(result).toHaveProperty("error")
      expect(result.error).toMatch(/nuk u gjet|nuk keni të drejta/i)
    })
  })
})

