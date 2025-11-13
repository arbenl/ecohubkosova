import { unstable_noStore as noStore } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Listing } from "@/types"

const ITEMS_PER_PAGE = 9

export interface ListingListOptions {
  type?: string
  search?: string
  category?: string
  page?: number
}

export async function fetchListings({
  type = "te-gjitha",
  search = "",
  category = "all",
  page = 1,
}: ListingListOptions) {
  noStore()
  const supabase = createServerSupabaseClient()

  try {
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = page * ITEMS_PER_PAGE - 1

    let query = supabase
      .from("tregu_listime")
      .select(
        `
        *,
        users!inner(emri_i_plote),
        organizations!inner(emri)
      `
      )
      .eq("eshte_aprovuar", true)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (type !== "te-gjitha") {
      query = query.eq("lloji_listimit", type)
    }

    if (search) {
      query = query.ilike("titulli", `%${search}%`)
    }

    if (category !== "all") {
      query = query.eq("kategori", category)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const list = (data ?? []) as Listing[]
    return {
      data: list,
      hasMore: list.length === ITEMS_PER_PAGE,
      error: null as string | null,
    }
  } catch (error) {
    console.error("fetchListings error:", error)
    return {
      data: [] as Listing[],
      hasMore: false,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të listimeve.",
    }
  }
}

export async function fetchListingById(id: string) {
  noStore()
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("tregu_listime")
      .select(
        `
        *,
        users!inner(emri_i_plote, email),
        organizations (emri, email_kontakti)
      `
      )
      .eq("id", id)
      .eq("eshte_aprovuar", true)
      .single()

    if (error) {
      throw error
    }

    return { data: data as Listing, error: null as string | null }
  } catch (error) {
    console.error("fetchListingById error:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Listimi nuk u gjet ose nuk është i aprovuar.",
    }
  }
}
