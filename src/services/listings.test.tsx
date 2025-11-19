import { describe, expect, it, vi } from "vitest"
import { fetchListings, fetchListingById, createUserListing, updateUserListing, deleteUserListing } from "./listings"

// Mock Next.js
vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
}))

// Mock external dependencies
vi.mock("@/lib/drizzle", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(),
            })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
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
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
  },
}))

vi.mock("@/db/schema", () => ({
  listings: {},
  users: {},
}))

describe("listings service", () => {
  it("should export fetchListings function", () => {
    expect(typeof fetchListings).toBe('function')
  })

  it("should export fetchListingById function", () => {
    expect(typeof fetchListingById).toBe('function')
  })

  it("should export createUserListing function", () => {
    expect(typeof createUserListing).toBe('function')
  })

  it("should export updateUserListing function", () => {
    expect(typeof updateUserListing).toBe('function')
  })

  it("should export deleteUserListing function", () => {
    expect(typeof deleteUserListing).toBe('function')
  })
})