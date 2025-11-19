import { describe, expect, it, vi } from "vitest"
import { fetchDashboardStats, fetchLatestArticles, fetchKeyPartners } from "./dashboard"

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
            limit: vi.fn(),
          })),
        })),
      })),
    })),
    $count: vi.fn(() => ({
      table: vi.fn(),
    })),
  },
}))

vi.mock("@/db/schema", () => ({
  articles: {},
  listings: {},
  organizations: {},
  users: {},
}))

describe("dashboard service", () => {
  it("should export fetchDashboardStats function", () => {
    expect(typeof fetchDashboardStats).toBe('function')
  })

  it("should export fetchLatestArticles function", () => {
    expect(typeof fetchLatestArticles).toBe('function')
  })

  it("should export fetchKeyPartners function", () => {
    expect(typeof fetchKeyPartners).toBe('function')
  })
})