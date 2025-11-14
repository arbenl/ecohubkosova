import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  rows: [
    {
      id: "article-1",
      titulli: "Titulli",
      permbajtja: "Permbajtje",
      autori_id: "admin",
      eshte_publikuar: true,
      kategori: "Kategori",
      tags: ["t1"],
      foto_kryesore: null,
      created_at: new Date("2024-01-01"),
      updated_at: null,
    },
  ],
}))

const deleteWhere = vi.fn()
const updateWhere = vi.fn()

const client = {
  select: vi.fn(() => ({ from: vi.fn(() => Promise.resolve(state.rows)) })),
  insert: vi.fn(() => ({ values: vi.fn(() => Promise.resolve()) })),
  delete: vi.fn(() => ({ where: deleteWhere })),
  update: vi.fn(() => ({
    set: (payload: any) => {
      updateWhere.payload = payload
      return { where: updateWhere }
    },
  })),
}

vi.mock("@/lib/drizzle", () => ({
  db: {
    get: () => client,
  },
}))

const eqMock = vi.hoisted(() => vi.fn((_column: unknown, value: unknown) => ({ value })))
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<any>()
  return { ...actual, eq: eqMock }
})

import {
  deleteArticleRecord,
  fetchAdminArticles,
  insertArticleRecord,
  updateArticleRecord,
} from "../articles"

describe("services/admin/articles", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("serializes articles", async () => {
    const result = await fetchAdminArticles()
    expect(result.data?.[0].created_at).toBe("2024-01-01T00:00:00.000Z")
    expect(Array.isArray(result.data?.[0].tags)).toBe(true)
  })

  it("inserts article", async () => {
    const result = await insertArticleRecord("admin", {
      titulli: "Titulli",
      permbajtja: "Permbajtje e gjatë",
      kategori: "Kategori",
      eshte_publikuar: true,
      tags: null,
      foto_kryesore: null,
    })

    expect(result.error).toBeNull()
  })

  it("deletes article", async () => {
    const result = await deleteArticleRecord("article-1")
    expect(result.error).toBeNull()
    expect(deleteWhere).toHaveBeenCalled()
  })

  it("updates article", async () => {
    const result = await updateArticleRecord("article-1", {
      titulli: "Titulli",
      permbajtja: "Permbajtje e gjatë",
      kategori: "Kategori",
      eshte_publikuar: true,
      tags: [],
      foto_kryesore: null,
    })
    expect(result.error).toBeNull()
    expect(updateWhere.payload.updated_at).toBeInstanceOf(Date)
  })
})
