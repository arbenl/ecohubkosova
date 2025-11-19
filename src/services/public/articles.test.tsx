import { describe, expect, it, vi } from "vitest"
import { fetchPublicArticles } from "./articles"

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
  articles: {},
}))

describe("public articles service", () => {
  it("should export fetchPublicArticles function", () => {
    expect(typeof fetchPublicArticles).toBe('function')
  })
})