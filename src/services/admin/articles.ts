import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { articles } from "@/db/schema"
import { createServerSupabaseClient } from "@/lib/supabase/server"
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

const ARTICLES_TABLE = "artikuj"

const formatTimestamp = (value: Date | string | null | undefined) => {
  if (!value) {
    return null
  }
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

const toError = (error: unknown) => {
  if (!error) {
    return null
  }
  return error instanceof Error ? error : new Error(typeof error === "object" && error && "message" in error ? String((error as any).message) : "Supabase error")
}

async function fetchAdminArticlesViaSupabase() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from(ARTICLES_TABLE).select("*")

  if (error) {
    return { data: null, error: toError(error) }
  }

  const serialized =
    ((data ?? []).map((article: Record<string, any>) => ({
      ...article,
      tags: article.tags ?? null,
      created_at: formatTimestamp(article.created_at) ?? "",
      updated_at: formatTimestamp(article.updated_at),
    })) ?? []) as AdminArticle[]

  return { data: serialized, error: null }
}

async function insertArticleViaSupabase(authorId: string, data: AdminArticleCreateInput) {
  const supabase = createServerSupabaseClient()
  const now = new Date().toISOString()
  const { error } = await supabase.from(ARTICLES_TABLE).insert({
    ...data,
    tags: data.tags ?? [],
    autori_id: authorId,
    created_at: now,
    updated_at: now,
  })

  return { error: toError(error) }
}

async function deleteArticleViaSupabase(articleId: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from(ARTICLES_TABLE).delete().eq("id", articleId)
  return { error: toError(error) }
}

async function updateArticleViaSupabase(articleId: string, data: AdminArticleUpdateInput) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from(ARTICLES_TABLE)
    .update({
      ...data,
      tags: data.tags ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId)

  return { error: toError(error) }
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
    console.warn("[services/admin/articles] Drizzle fetch failed; falling back to Supabase REST.", error)
    return fetchAdminArticlesViaSupabase()
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
    console.warn("[services/admin/articles] Drizzle insert failed; falling back to Supabase REST.", error)
    return insertArticleViaSupabase(authorId, data)
  }
}

export async function deleteArticleRecord(articleId: string) {
  try {
    await db.get().delete(articles).where(eq(articles.id, articleId))
    return { error: null }
  } catch (error) {
    console.warn("[services/admin/articles] Drizzle delete failed; falling back to Supabase REST.", error)
    return deleteArticleViaSupabase(articleId)
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
    console.warn("[services/admin/articles] Drizzle update failed; falling back to Supabase REST.", error)
    return updateArticleViaSupabase(articleId, data)
  }
}
