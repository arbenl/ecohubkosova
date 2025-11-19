import { describe, expect, it, vi } from "vitest"
import { fetchAdminOrganizations, deleteOrganizationRecord, updateOrganizationRecord } from "./organizations"

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
  organizations: {
    $inferSelect: {},
  },
}))

vi.mock("@/validation/admin", () => ({
  AdminOrganizationUpdateInput: {},
}))

describe("admin organizations service", () => {
  it("should export fetchAdminOrganizations function", () => {
    expect(typeof fetchAdminOrganizations).toBe('function')
  })

  it("should export deleteOrganizationRecord function", () => {
    expect(typeof deleteOrganizationRecord).toBe('function')
  })

  it("should export updateOrganizationRecord function", () => {
    expect(typeof updateOrganizationRecord).toBe('function')
  })
})