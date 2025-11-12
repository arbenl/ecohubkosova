"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

interface Organization {
  id: string
  emri: string
  pershkrimi: string
  interesi_primar: string
  vendndodhja: string
  lloji: string
  created_at: string
}

interface GetOrganizationsDataParams {
  search?: string
  type?: string
  interest?: string
  page?: string
}

interface GetOrganizationsDataResult {
  initialOrganizations: Organization[]
  hasMoreInitial: boolean
  error: string | null
}

export async function getOrganizationsData(
  searchParams: GetOrganizationsDataParams
): Promise<GetOrganizationsDataResult> {
  const supabase = createServerSupabaseClient()

  const initialSearchQuery = searchParams.search || ""
  const initialSelectedType = searchParams.type || "all"
  const initialSelectedInterest = searchParams.interest || "all"
  const initialPage = parseInt(searchParams.page || "1")
  const itemsPerPage = 9

  try {
    const from = (initialPage - 1) * itemsPerPage
    const to = initialPage * itemsPerPage - 1

    let query = supabase
      .from("organizations")
      .select("*")
      .eq("eshte_aprovuar", true)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (initialSearchQuery) {
      query = query.or(`emri.ilike.%${initialSearchQuery}%,pershkrimi.ilike.%${initialSearchQuery}%`)
    }

    if (initialSelectedType && initialSelectedType !== "all") {
      query = query.eq("lloji", initialSelectedType)
    }

    if (initialSelectedInterest && initialSelectedInterest !== "all") {
      query = query.ilike("interesi_primar", `%${initialSelectedInterest}%`)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const initialOrganizations = data || []
    const hasMoreInitial = initialOrganizations.length === itemsPerPage

    return { initialOrganizations, hasMoreInitial, error: null }
  } catch (error: any) {
    console.error("Error fetching initial organizations:", error)
    return {
      initialOrganizations: [],
      hasMoreInitial: false,
      error: error.message || "Gabim gjatë ngarkimit të organizatave.",
    }
  }
}
