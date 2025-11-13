import { unstable_noStore as noStore } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const ITEMS_PER_PAGE = 9

export interface ArticleListOptions {
  search?: string
  category?: string
  page?: number
}

export interface ArticleRecord {
  id: string
  titulli: string
  permbajtja: string
  kategori: string
  tags: string[] | null
  created_at: string
  users?: {
    emri_i_plote?: string | null
  } | null
}

export async function fetchArticlesList({
  search = "",
  category = "all",
  page = 1,
}: ArticleListOptions) {
  noStore()
  const supabase = createServerSupabaseClient()

  try {
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = page * ITEMS_PER_PAGE - 1

    let query = supabase
      .from("artikuj")
      .select(
        `
        *,
        users (emri_i_plote)
      `
      )
      .eq("eshte_publikuar", true)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(`titulli.ilike.%${search}%,permbajtja.ilike.%${search}%`)
    }

    if (category !== "all") {
      query = query.eq("kategori", category)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const list = (data ?? []) as ArticleRecord[]
    return {
      data: list,
      hasMore: list.length === ITEMS_PER_PAGE,
      error: null as string | null,
    }
  } catch (error) {
    console.error("fetchArticlesList error:", error)
    return {
      data: [] as ArticleRecord[],
      hasMore: false,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të artikujve.",
    }
  }
}

export async function fetchArticleById(id: string) {
  noStore()
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("artikuj")
      .select(
        `
        *,
        users!inner(emri_i_plote)
      `
      )
      .eq("id", id)
      .eq("eshte_publikuar", true)
      .single()

    if (error) {
      throw error
    }

    return { data: data as ArticleRecord, error: null as string | null }
  } catch (error) {
    console.error("fetchArticleById error:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Artikulli nuk u gjet ose nuk është i publikuar.",
    }
  }
}
