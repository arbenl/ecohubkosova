import { unstable_noStore as noStore } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function fetchDashboardStats() {
  noStore()
  const supabase = createServerSupabaseClient()

  try {
    const [
      { count: organizationsCount },
      { count: articlesCount },
      { count: usersCount },
      { count: listingsCount },
    ] = await Promise.all([
      supabase.from("organizations").select("*", { count: "exact", head: true }).eq("eshte_aprovuar", true),
      supabase.from("artikuj").select("*", { count: "exact", head: true }).eq("eshte_publikuar", true),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("tregu_listime").select("*", { count: "exact", head: true }).eq("eshte_aprovuar", true),
    ])

    return {
      organizationsCount: organizationsCount || 0,
      articlesCount: articlesCount || 0,
      usersCount: usersCount || 0,
      listingsCount: listingsCount || 0,
    }
  } catch (error) {
    console.error("fetchDashboardStats error:", error)
    return {
      organizationsCount: 0,
      articlesCount: 0,
      usersCount: 0,
      listingsCount: 0,
    }
  }
}

export async function fetchLatestArticles(limit = 3) {
  noStore()
  const supabase = createServerSupabaseClient()

  try {
    const { data: articles } = await supabase
      .from("artikuj")
      .select("*, users!inner(emri_i_plote)")
      .eq("eshte_publikuar", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    return articles || []
  } catch (error) {
    console.error("fetchLatestArticles error:", error)
    return []
  }
}

export async function fetchKeyPartners(limit = 5) {
  noStore()
  const supabase = createServerSupabaseClient()

  try {
    const { data: partners } = await supabase
      .from("organizations")
      .select("*")
      .eq("eshte_aprovuar", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    return partners || []
  } catch (error) {
    console.error("fetchKeyPartners error:", error)
    return []
  }
}
