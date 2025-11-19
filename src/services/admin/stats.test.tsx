import { describe, expect, it, vi } from "vitest"
import { fetchAdminStats } from "./stats"

// Mock external dependencies
vi.mock("@/lib/drizzle", () => ({
  db: {
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

describe("admin stats service", () => {
  it("should export fetchAdminStats function", () => {
    expect(typeof fetchAdminStats).toBe('function')
  })
})