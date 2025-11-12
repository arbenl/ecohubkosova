"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface ArticleCreateData {
  titulli: string
  përmbajtja: string
  kategori: string
  eshte_publikuar: boolean
  tags: string[] | null
  foto_kryesore: string | null
}

interface ArticleUpdateData {
  titulli: string
  përmbajtja: string
  kategori: string
  eshte_publikuar: boolean
  tags: string[] | null
  foto_kryesore: string | null
  updated_at: string
}

export async function createArticle(formData: ArticleCreateData) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të krijoni artikuj.")
  }

  try {
    const { error } = await supabase.from("artikuj").insert([
      {
        titulli: formData.titulli,
        përmbajtja: formData.përmbajtja,
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të fshini artikuj.")
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të përditësoni artikuj.")
  }

  try {
    const { error } = await supabase
      .from("artikuj")
      .update({
        titulli: formData.titulli,
        përmbajtja: formData.përmbajtja,
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
