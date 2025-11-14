"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdminRole } from "@/lib/auth/roles"
import {
  deleteArticleRecord,
  fetchAdminArticles,
  insertArticleRecord,
  updateArticleRecord,
  type AdminArticle,
  type AdminArticleCreateInput,
  type AdminArticleUpdateInput,
} from "@/services/admin/articles"
import { adminArticleCreateSchema, adminArticleUpdateSchema } from "@/validation/admin"

type ArticleCreateData = AdminArticleCreateInput
type ArticleUpdateData = AdminArticleUpdateInput

type GetArticlesResult = {
  data: AdminArticle[] | null
  error: string | null
}

export async function getArticles(): Promise<GetArticlesResult> {
  try {
    const { data, error } = await fetchAdminArticles()

    if (error) {
      console.error("Error fetching articles:", error)
      return { data: null, error: error.message || "Gabim gjatë marrjes së artikujve." }
    }

    return { data: data ?? [], error: null }
  } catch (error) {
    console.error("Server Action Error (getArticles):", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gabim i panjohur gjatë marrjes së artikujve.",
    }
  }
}

export async function createArticle(formData: ArticleCreateData) {
  const supabase = createRouteHandlerSupabaseClient()
  const { user } = await requireAdminRole(supabase)

  const parsed = adminArticleCreateSchema.safeParse(formData)
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message || "Të dhënat e artikullit nuk janë të vlefshme."
    return { error: message }
  }

  try {
    const { error } = await insertArticleRecord(supabase, user.id, parsed.data)

    if (error) {
      console.error("Error creating article:", error)
      return { error: error.message || "Gabim gjatë krijimit të artikullit." }
    }

    revalidatePath("/admin/articles")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (createArticle):", error)
    return { error: error.message || "Gabim i panjohur gjatë krijimit të artikullit." }
  }
}

export async function deleteArticle(articleId: string) {
  const supabase = createRouteHandlerSupabaseClient()
  await requireAdminRole(supabase)

  try {
    const { error } = await deleteArticleRecord(supabase, articleId)

    if (error) {
      console.error("Error deleting article:", error)
      return { error: error.message || "Gabim gjatë fshirjes së artikullit." }
    }

    revalidatePath("/admin/articles")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (deleteArticle):", error)
    return { error: error.message || "Gabim i panjohur gjatë fshirjes së artikullit." }
  }
}

export async function updateArticle(articleId: string, formData: ArticleUpdateData) {
  const supabase = createRouteHandlerSupabaseClient()
  await requireAdminRole(supabase)

  const parsed = adminArticleUpdateSchema.safeParse(formData)
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message || "Të dhënat e artikullit nuk janë të vlefshme."
    return { error: message }
  }

  try {
    const { error } = await updateArticleRecord(supabase, articleId, parsed.data)

    if (error) {
      console.error("Error updating article:", error)
      return { error: error.message || "Gabim gjatë përditësimit të artikullit." }
    }

    revalidatePath("/admin/articles")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateArticle):", error)
    return { error: error.message || "Gabim i panjohur gjatë përditësimit të artikullit." }
  }
}
