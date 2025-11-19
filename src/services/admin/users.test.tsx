import { describe, expect, it, vi } from "vitest"
import { fetchAdminUsers, deleteUserRecord, updateUserRecord } from "./users"

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
  users: {
    $inferSelect: {},
  },
}))

vi.mock("@/validation/admin", () => ({
  AdminUserUpdateInput: {},
}))

describe("admin users service", () => {
  it("should export fetchAdminUsers function", () => {
    expect(typeof fetchAdminUsers).toBe('function')
  })

  it("should export deleteUserRecord function", () => {
    expect(typeof deleteUserRecord).toBe('function')
  })

  it("should export updateUserRecord function", () => {
    expect(typeof updateUserRecord).toBe('function')
  })
})