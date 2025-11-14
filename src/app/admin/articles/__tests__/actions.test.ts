import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  requireAdminRole: vi.fn(),
  fetchAdminArticles: vi.fn(),
  insertArticleRecord: vi.fn(),
  deleteArticleRecord: vi.fn(),
  updateArticleRecord: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock("@/lib/auth/roles", () => ({
  requireAdminRole: mocks.requireAdminRole,
}))

vi.mock("@/services/admin/articles", () => ({
  fetchAdminArticles: mocks.fetchAdminArticles,
  insertArticleRecord: mocks.insertArticleRecord,
  deleteArticleRecord: mocks.deleteArticleRecord,
  updateArticleRecord: mocks.updateArticleRecord,
}))

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}))

import { createArticle, deleteArticle, getArticles, updateArticle } from "../actions"

describe("admin/articles actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAdminRole.mockResolvedValue({ user: { id: "admin" } })
  })

  it("returns articles", async () => {
    mocks.fetchAdminArticles.mockResolvedValue({ data: [{ id: "article-1" }], error: null })
    const result = await getArticles()
    expect(result).toEqual({ data: [{ id: "article-1" }], error: null })
  })

  it("creates article when payload is valid", async () => {
    mocks.requireAdminRole.mockResolvedValue({ user: { id: "admin-id" } })
    mocks.insertArticleRecord.mockResolvedValue({ error: null })

    const result = await createArticle({
      titulli: "Titulli",
      permbajtja: "Kjo është një përmbajtje e gjatë e artikullit që kalon kufirin minimal.",
      kategori: "Kategori",
      eshte_publikuar: true,
      tags: null,
      foto_kryesore: null,
    })

    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.insertArticleRecord).toHaveBeenCalled()
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/articles")
    expect(result).toEqual({ success: true })
  })

  it("validates payloads for create", async () => {
    const result = await createArticle({
      titulli: "",
      permbajtja: "",
      kategori: "",
      eshte_publikuar: true,
      tags: null,
      foto_kryesore: null,
    } as any)
    expect(result.error).toBeTruthy()
    expect(mocks.insertArticleRecord).not.toHaveBeenCalled()
  })

  it("deletes article", async () => {
    mocks.deleteArticleRecord.mockResolvedValue({ error: null })
    const result = await deleteArticle("article-1")
    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.deleteArticleRecord).toHaveBeenCalledWith("article-1")
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/articles")
    expect(result).toEqual({ success: true })
  })

  it("updates article", async () => {
    mocks.updateArticleRecord.mockResolvedValue({ error: null })
    const result = await updateArticle("article-1", {
      titulli: "Titulli",
      permbajtja: "Kjo është një përmbajtje edhe më e gjatë për të kaluar validimin e zgjatur.",
      kategori: "Kategori",
      eshte_publikuar: false,
      tags: [],
      foto_kryesore: null,
    })
    expect(mocks.requireAdminRole).toHaveBeenCalled()
    expect(mocks.updateArticleRecord).toHaveBeenCalled()
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/articles")
    expect(result).toEqual({ success: true })
  })
})
