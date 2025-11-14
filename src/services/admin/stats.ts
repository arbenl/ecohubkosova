import { count, eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { articles, marketplaceListings, organizations, users } from "@/db/schema"

export interface AdminStats {
  users: number
  organizations: number
  pendingOrganizations: number
  articles: number
  pendingArticles: number
  listings: number
  pendingListings: number
}

type FetchAdminStatsResult = {
  data: AdminStats | null
  error: Error | null
}

export async function fetchAdminStats(): Promise<FetchAdminStatsResult> {
  try {
    const database = db.get()
    const [userCount, organizationsCount, pendingOrganizations, articlesCount, pendingArticles, listingsCount, pendingListings] = await Promise.all([
      database.select({ value: count() }).from(users),
      database.select({ value: count() }).from(organizations),
      database
        .select({ value: count() })
        .from(organizations)
        .where(eq(organizations.eshte_aprovuar, false)),
      database.select({ value: count() }).from(articles),
      database
        .select({ value: count() })
        .from(articles)
        .where(eq(articles.eshte_publikuar, false)),
      database.select({ value: count() }).from(marketplaceListings),
      database
        .select({ value: count() })
        .from(marketplaceListings)
        .where(eq(marketplaceListings.eshte_aprovuar, false)),
    ])

    const stats: AdminStats = {
      users: userCount[0]?.value ?? 0,
      organizations: organizationsCount[0]?.value ?? 0,
      pendingOrganizations: pendingOrganizations[0]?.value ?? 0,
      articles: articlesCount[0]?.value ?? 0,
      pendingArticles: pendingArticles[0]?.value ?? 0,
      listings: listingsCount[0]?.value ?? 0,
      pendingListings: pendingListings[0]?.value ?? 0,
    }

    return { data: stats, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Gabim i panjohur gjatë marrjes së statistikave."),
    }
  }
}
