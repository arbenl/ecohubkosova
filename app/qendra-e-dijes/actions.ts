"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

interface Article {
  id: string
  titulli: string
  përmbajtja: string
  kategori: string
  tags: string[]
  created_at: string
  users: {
    emri_i_plotë: string
  }
  [key: string]: unknown
}

interface GetArticlesDataParams {
  search?: string
  category?: string
  page?: string
}

interface GetArticlesDataResult {
  initialArticles: Article[]
  hasMoreInitial: boolean
  error: string | null
}

export async function getArticlesData(
  searchParams: GetArticlesDataParams
): Promise<GetArticlesDataResult> {
  const supabase = createServerSupabaseClient()

  const initialSearchQuery = searchParams.search || ""
  const initialSelectedCategory = searchParams.category || "all"
  const initialPage = parseInt(searchParams.page || "1")
  const itemsPerPage = 9

  try {
    const from = (initialPage - 1) * itemsPerPage
    const to = initialPage * itemsPerPage - 1

    let query = supabase
      .from("artikuj")
      .select(
        `
        *,
        users (emri_i_plotë)
      `
      )
      .eq("eshte_publikuar", true)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (initialSearchQuery) {
      query = query.or(`titulli.ilike.%${initialSearchQuery}%,përmbajtja.ilike.%${initialSearchQuery}%`)
    }

    if (initialSelectedCategory && initialSelectedCategory !== "all") {
      query = query.eq("kategori", initialSelectedCategory)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const initialArticles = (data ?? []) as unknown as Article[]
    const hasMoreInitial = initialArticles.length === itemsPerPage

    return { initialArticles, hasMoreInitial, error: null }
  } catch (error: any) {
    console.error("Error fetching initial articles:", error)
    return {
      initialArticles: [],
      hasMoreInitial: false,
      error: error.message || "Gabim gjatë ngarkimit të artikujve.",
    }
  }
}
