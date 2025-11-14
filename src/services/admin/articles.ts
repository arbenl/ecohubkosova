import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

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

export interface AdminArticleCreateInput {
  titulli: string
  permbajtja: string
  kategori: string
  eshte_publikuar: boolean
  tags: string[] | null
  foto_kryesore: string | null
}

export interface AdminArticleUpdateInput extends AdminArticleCreateInput {}

type AnySupabaseClient = SupabaseClient<any, any, any>

export async function fetchAdminArticles() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("artikuj").select("*")
  return { data: data ?? [], error }
}

export function insertArticleRecord(
  supabase: AnySupabaseClient,
  authorId: string,
  data: AdminArticleCreateInput
) {
  return supabase.from("artikuj").insert([
    {
      ...data,
      autori_id: authorId,
      created_at: new Date().toISOString(),
      updated_at: null,
    },
  ])
}

export function deleteArticleRecord(supabase: AnySupabaseClient, articleId: string) {
  return supabase.from("artikuj").delete().eq("id", articleId)
}

export function updateArticleRecord(
  supabase: AnySupabaseClient,
  articleId: string,
  data: AdminArticleUpdateInput
) {
  return supabase
    .from("artikuj")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId)
}
