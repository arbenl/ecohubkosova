import { describe, expect, it, vi } from "vitest"
import { fetchAdminArticles, insertArticleRecord, deleteArticleRecord, updateArticleRecord } from "./articles"

// Mock external dependencies
vi.mock("@/lib/drizzle", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        orderBy: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
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
  articles: {
    $inferSelect: {},
  },
}))

vi.mock("@/validation/admin", () => ({
  AdminArticleCreateInput: {},
  AdminArticleUpdateInput: {},
}))

describe("admin articles service", () => {
  it("should export fetchAdminArticles function", () => {
    expect(typeof fetchAdminArticles).toBe('function')
  })

  it("should export insertArticleRecord function", () => {
    expect(typeof insertArticleRecord).toBe('function')
  })

  it("should export deleteArticleRecord function", () => {
    expect(typeof deleteArticleRecord).toBe('function')
  })

  it("should export updateArticleRecord function", () => {
    expect(typeof updateArticleRecord).toBe('function')
  })
})