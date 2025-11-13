import { unstable_noStore as noStore } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Organization } from "@/types"

const ITEMS_PER_PAGE = 9

export interface OrganizationListOptions {
  search?: string
  type?: string
  interest?: string
  page?: number
}

export interface PaginatedResult<T> {
  data: T[]
  hasMore: boolean
  error: string | null
}

export async function fetchOrganizationsList({
  search = "",
  type = "all",
  interest = "all",
  page = 1,
}: OrganizationListOptions): Promise<PaginatedResult<Organization>> {
  noStore()
  const supabase = createServerSupabaseClient()

  try {
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = page * ITEMS_PER_PAGE - 1

    let query = supabase
      .from("organizations")
      .select("*")
      .eq("eshte_aprovuar", true)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(`emri.ilike.%${search}%,pershkrimi.ilike.%${search}%`)
    }

    if (type !== "all") {
      query = query.eq("lloji", type)
    }

    if (interest !== "all") {
      query = query.ilike("interesi_primar", `%${interest}%`)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const list = data ?? []
    return {
      data: list,
      hasMore: list.length === ITEMS_PER_PAGE,
      error: null,
    }
  } catch (error) {
    console.error("fetchOrganizationsList error:", error)
    return {
      data: [],
      hasMore: false,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të organizatave.",
    }
  }
}

export async function fetchOrganizationById(id: string) {
  noStore()
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .eq("eshte_aprovuar", true)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null as string | null }
  } catch (error) {
    console.error("fetchOrganizationById error:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të organizatës.",
    }
  }
}
