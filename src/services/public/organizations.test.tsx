import { describe, expect, it, vi } from "vitest"
import { fetchPublicOrganizations } from "./organizations"

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
  organizations: {},
}))

describe("public organizations service", () => {
  it("should export fetchPublicOrganizations function", () => {
    expect(typeof fetchPublicOrganizations).toBe('function')
  })
})