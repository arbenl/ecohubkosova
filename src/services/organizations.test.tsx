import { describe, expect, it, vi } from "vitest"
import { fetchOrganizationsList, fetchOrganizationById } from "./organizations"

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
    query: {
      organizations: {
        findFirst: vi.fn(),
      },
    },
  },
}))

vi.mock("@/db/schema", () => ({
  organizations: {},
}))

describe("organizations service", () => {
  it("should export fetchOrganizationsList function", () => {
    expect(typeof fetchOrganizationsList).toBe('function')
  })

  it("should export fetchOrganizationById function", () => {
    expect(typeof fetchOrganizationById).toBe('function')
  })
})