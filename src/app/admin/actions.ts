"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface AdminStats {
  users: number
  organizations: number
  pendingOrganizations: number
  articles: number
  pendingArticles: number
  listings: number
  pendingListings: number
}

type GetAdminStatsResult = {
  data: AdminStats | null
  error: string | null
}

export async function getAdminStats(): Promise<GetAdminStatsResult> {
  const supabase = createServerSupabaseClient()

  try {
    const [
      usersResponse,
      organizationsResponse,
      pendingOrganizationsResponse,
      articlesResponse,
      pendingArticlesResponse,
      listingsResponse,
      pendingListingsResponse,
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("organizations").select("*", { count: "exact", head: true }),
      supabase.from("organizations").select("*", { count: "exact", head: true }).eq("eshte_aprovuar", false),
      supabase.from("artikuj").select("*", { count: "exact", head: true }),
      supabase.from("artikuj").select("*", { count: "exact", head: true }).eq("eshte_publikuar", false),
      supabase.from("tregu_listime").select("*", { count: "exact", head: true }),
      supabase.from("tregu_listime").select("*", { count: "exact", head: true }).eq("eshte_aprovuar", false),
    ])

    const responses = [
      usersResponse,
      organizationsResponse,
      pendingOrganizationsResponse,
      articlesResponse,
      pendingArticlesResponse,
      listingsResponse,
      pendingListingsResponse,
    ]

    for (const response of responses) {
      if (response.error) {
        throw response.error
      }
    }

    const stats: AdminStats = {
      users: usersResponse.count ?? 0,
      organizations: organizationsResponse.count ?? 0,
      pendingOrganizations: pendingOrganizationsResponse.count ?? 0,
      articles: articlesResponse.count ?? 0,
      pendingArticles: pendingArticlesResponse.count ?? 0,
      listings: listingsResponse.count ?? 0,
      pendingListings: pendingListingsResponse.count ?? 0,
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error("Server Action Error (getAdminStats):", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gabim gjatë marrjes së statistikave.",
    }
  }
}
