"use server"

import { createRouteHandlerSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdminRole } from "@/lib/auth/roles"

interface Article {
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

interface ArticleCreateData {
  titulli: string
  permbajtja: string
  kategori: string
  eshte_publikuar: boolean
  tags: string[] | null
  foto_kryesore: string | null
}

interface ArticleUpdateData {
  titulli: string
  permbajtja: string
  kategori: string
  eshte_publikuar: boolean
  tags: string[] | null
  foto_kryesore: string | null
  updated_at: string
}

type GetArticlesResult = {
  data: Article[] | null
  error: string | null
}

export async function getArticles(): Promise<GetArticlesResult> {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("artikuj").select("*")

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

  try {
    const { error } = await supabase.from("artikuj").insert([
      {
        titulli: formData.titulli,
        permbajtja: formData.permbajtja,
        kategori: formData.kategori,
        eshte_publikuar: formData.eshte_publikuar,
        tags: formData.tags,
        foto_kryesore: formData.foto_kryesore,
        autori_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: null,
      },
    ])

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
    const { error } = await supabase.from("artikuj").delete().eq("id", articleId)

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

  try {
    const { error } = await supabase
      .from("artikuj")
      .update({
        titulli: formData.titulli,
        permbajtja: formData.permbajtja,
        kategori: formData.kategori,
        eshte_publikuar: formData.eshte_publikuar,
        tags: formData.tags,
        foto_kryesore: formData.foto_kryesore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId)

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
