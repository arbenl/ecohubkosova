"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Listing } from "@/types" // Assuming Listing type is globally available or defined in @/types

interface GetListingsDataParams {
  lloji?: string
  search?: string
  category?: string
  page?: string
}

interface GetListingsDataResult {
  initialListings: Listing[]
  hasMoreInitial: boolean
  error: string | null
}

export async function getListingsData(
  searchParams: GetListingsDataParams
): Promise<GetListingsDataResult> {
  const supabase = createServerSupabaseClient()

  const initialTab =
    searchParams.lloji === "blej" ? "blej" : searchParams.lloji === "shes" ? "shes" : "te-gjitha"
  const initialSearchQuery = searchParams.search || ""
  const initialSelectedCategory = searchParams.category || "all"
  const initialPage = parseInt(searchParams.page || "1")
  const itemsPerPage = 9

  try {
    const from = (initialPage - 1) * itemsPerPage
    const to = initialPage * itemsPerPage - 1

    let query = supabase
      .from("tregu_listime")
      .select(
        `
        *,
        users!inner("emri_i_plotë"),
        organizations!inner(emri)
      `
      )
      .eq("eshte_aprovuar", true)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (initialTab !== "te-gjitha") {
      query = query.eq("lloji_listimit", initialTab)
    }

    if (initialSearchQuery) {
      query = query.ilike("titulli", `%${initialSearchQuery}%`)
    }

    if (initialSelectedCategory && initialSelectedCategory !== "all") {
      query = query.eq("kategori", initialSelectedCategory)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const initialListings = data || []
    const hasMoreInitial = data?.length === itemsPerPage

    return { initialListings, hasMoreInitial, error: null }
  } catch (error: any) {
    console.error("Gabim gjatë ngarkimit të listimeve fillestare:", error)
    return {
      initialListings: [],
      hasMoreInitial: false,
      error: error.message || "Gabim gjatë ngarkimit të listimeve.",
    }
  }
}
