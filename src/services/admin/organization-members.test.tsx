import { describe, expect, it, vi } from "vitest"
import { fetchAdminOrganizationMembers, deleteOrganizationMemberRecord, updateOrganizationMemberRecord, toggleOrganizationMemberApprovalRecord } from "./organization-members"

// Mock external dependencies
vi.mock("@/lib/drizzle", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          leftJoin: vi.fn(() => ({
            orderBy: vi.fn(),
          })),
        })),
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
  organizationMembers: {
    $inferSelect: {},
  },
  organizations: {},
  users: {},
}))

vi.mock("@/validation/admin", () => ({
  AdminOrganizationMemberUpdateInput: {},
}))

describe("admin organization-members service", () => {
  it("should export fetchAdminOrganizationMembers function", () => {
    expect(typeof fetchAdminOrganizationMembers).toBe('function')
  })

  it("should export deleteOrganizationMemberRecord function", () => {
    expect(typeof deleteOrganizationMemberRecord).toBe('function')
  })

  it("should export updateOrganizationMemberRecord function", () => {
    expect(typeof updateOrganizationMemberRecord).toBe('function')
  })

  it("should export toggleOrganizationMemberApprovalRecord function", () => {
    expect(typeof toggleOrganizationMemberApprovalRecord).toBe('function')
  })
})