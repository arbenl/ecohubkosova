import { describe, expect, it, vi } from "vitest"
import { fetchPublicListings } from "./listings"

// Mock external dependencies
vi.mock("next/cache", () => ({
  unstable_noStore: vi.fn(),
}))

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
  },
}))

vi.mock("@/db/schema", () => ({
  listings: {},
  users: {},
}))

describe("public listings service", () => {
  it("should export fetchPublicListings function", () => {
    expect(typeof fetchPublicListings).toBe('function')
  })
})