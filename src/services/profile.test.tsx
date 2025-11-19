import { describe, expect, it, vi } from "vitest"
import { fetchCurrentUserProfile, fetchUserProfileById, updateUserProfileRecord, updateOrganizationRecord, ensureUserOrganizationMembership, getCachedUserProfileById } from "./profile"

// Mock Next.js
vi.mock("next/cache", () => ({
  cache: vi.fn((fn) => fn),
}))

// Mock external dependencies
vi.mock("@/lib/drizzle", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
      })),
    })),
  },
}))

vi.mock("@/db/schema", () => ({
  users: {},
  organizations: {},
  userOrganizations: {},
}))

describe("profile service", () => {
  it("should export fetchCurrentUserProfile function", () => {
    expect(typeof fetchCurrentUserProfile).toBe('function')
  })

  it("should export fetchUserProfileById function", () => {
    expect(typeof fetchUserProfileById).toBe('function')
  })

  it("should export updateUserProfileRecord function", () => {
    expect(typeof updateUserProfileRecord).toBe('function')
  })

  it("should export updateOrganizationRecord function", () => {
    expect(typeof updateOrganizationRecord).toBe('function')
  })

  it("should export ensureUserOrganizationMembership function", () => {
    expect(typeof ensureUserOrganizationMembership).toBe('function')
  })

  it("should export getCachedUserProfileById function", () => {
    expect(typeof getCachedUserProfileById).toBe('function')
  })
})