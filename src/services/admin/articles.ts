import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { articles } from "@/db/schema"
import type { AdminArticleCreateInput, AdminArticleUpdateInput } from "@/validation/admin"
export type { AdminArticleCreateInput, AdminArticleUpdateInput } from "@/validation/admin"

export type AdminArticleRow = typeof articles.$inferSelect

export interface AdminArticle {
  id: string
  titulli: string
  permbajtja: string
  autori_id: string
  eshte_publikuar: boolean
  kategori: string
  tags: string[] | null
  foto_kryesore: string | null
  created_at: string
  updated_at: string | null
}

export async function fetchAdminArticles() {
  try {
    const rows = await db.get().select().from(articles)
    const serialized: AdminArticle[] = rows.map((article) => ({
      ...article,
      tags: article.tags ?? null,
      created_at: article.created_at.toISOString(),
      updated_at: article.updated_at ? article.updated_at.toISOString() : null,
    }))

    return { data: serialized, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
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
        autori_id: authorId,
        created_at: new Date(),
        updated_at: new Date(),
      })

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

export async function deleteArticleRecord(articleId: string) {
  try {
    await db.get().delete(articles).where(eq(articles.id, articleId))
    return { error: null }
  } catch (error) {
    return { error: error as Error }
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
    return { error: error as Error }
  }
}
