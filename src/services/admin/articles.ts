import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { articles } from "@/db/schema"
import type { AdminArticleCreateInput, AdminArticleUpdateInput } from "@/validation/admin"
export type { AdminArticleCreateInput, AdminArticleUpdateInput } from "@/validation/admin"

export type AdminArticleRow = typeof articles.$inferSelect

export interface AdminArticle {
  id: string
  title: string
  content: string | null
  external_url?: string | null
  original_language?: string | null
  author_id: string
  is_published: boolean
  category: string
  tags: string[] | null
  featured_image: string | null
  created_at: string
  updated_at: string | null
}

const toError = (error: unknown) =>
  error instanceof Error
    ? error
    : new Error(typeof error === "string" ? error : "Gabim i panjohur.")

const serializeArticle = (article: AdminArticleRow): AdminArticle => ({
  ...article,
  tags: article.tags ?? null,
  external_url: article.external_url ?? null,
  original_language: article.original_language ?? null,
  created_at: article.created_at.toISOString(),
  updated_at: article.updated_at ? article.updated_at.toISOString() : null,
})

export async function fetchAdminArticles() {
  try {
    const rows = await db.get().select().from(articles)
    return { data: rows.map(serializeArticle), error: null }
  } catch (error) {
    console.error("[services/admin/articles] Failed to fetch articles:", error)
    return { data: null, error: toError(error) }
  }
}

export async function insertArticleRecord(authorId: string, data: AdminArticleCreateInput) {
  try {
    await db
      .get()
      .insert(articles)
      .values({
        ...data,
        tags: data.tags ?? [],
        author_id: authorId,
        created_at: new Date(),
        updated_at: new Date(),
      })

    return { error: null }
  } catch (error) {
    console.error("[services/admin/articles] Failed to insert article:", error)
    return { error: toError(error) }
  }
}

export async function deleteArticleRecord(articleId: string) {
  try {
    await db.get().delete(articles).where(eq(articles.id, articleId))
    return { error: null }
  } catch (error) {
    console.error("[services/admin/articles] Failed to delete article:", error)
    return { error: toError(error) }
  }
}

export async function updateArticleRecord(articleId: string, data: AdminArticleUpdateInput) {
  try {
    await db
      .get()
      .update(articles)
      .set({
        ...data,
        tags: data.tags ?? [],
        updated_at: new Date(),
      })
      .where(eq(articles.id, articleId))

    return { error: null }
  } catch (error) {
    console.error("[services/admin/articles] Failed to update article:", error)
    return { error: toError(error) }
  }
}

export async function fetchPendingArticles(limit = 5) {
  try {
    const rows = await db
      .get()
      .select()
      .from(articles)
      .where(eq(articles.is_published, false))
      .orderBy(articles.created_at)
      .limit(limit)

    return { data: rows.map(serializeArticle), error: null }
  } catch (error) {
    console.error("[services/admin/articles] Failed to fetch pending articles:", error)
    return { data: null, error: toError(error) }
  }
}

export async function approveArticleRecord(articleId: string) {
  try {
    await db
      .get()
      .update(articles)
      .set({ is_published: true, updated_at: new Date() })
      .where(eq(articles.id, articleId))
    return { error: null }
  } catch (error) {
    return { error: toError(error) }
  }
}

export async function rejectArticleRecord(articleId: string) {
  try {
    await db
      .get()
      .update(articles)
      .set({ is_published: false, updated_at: new Date() })
      .where(eq(articles.id, articleId))
    return { error: null }
  } catch (error) {
    return { error: toError(error) }
  }
}
