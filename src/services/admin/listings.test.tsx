import { describe, expect, it, vi } from "vitest"
import { fetchAdminListings, deleteListingRecord, updateListingRecord } from "./listings"

// Mock external dependencies
vi.mock("@/lib/drizzle", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
  },
}))

vi.mock("@/db/schema", () => ({
  marketplaceListings: {
    $inferSelect: {},
  },
}))

vi.mock("@/validation/admin", () => ({
  AdminListingUpdateInput: {},
}))

describe("admin listings service", () => {
  it("should export fetchAdminListings function", () => {
    expect(typeof fetchAdminListings).toBe('function')
  })

  it("should export deleteListingRecord function", () => {
    expect(typeof deleteListingRecord).toBe('function')
  })

  it("should export updateListingRecord function", () => {
    expect(typeof updateListingRecord).toBe('function')
  })
})