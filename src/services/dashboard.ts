import { unstable_noStore as noStore } from "next/cache"
import { count, desc, eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { articles, marketplaceListings, organizations, users } from "@/db/schema"

export async function fetchDashboardStats() {
  noStore()
  try {
    const database = db.get()
    const [orgs, articlesCount, userCount, listings] = await Promise.all([
      database
        .select({ value: count() })
        .from(organizations)
        .where(eq(organizations.eshte_aprovuar, true)),
      database
        .select({ value: count() })
        .from(articles)
        .where(eq(articles.eshte_publikuar, true)),
      database.select({ value: count() }).from(users),
      database
        .select({ value: count() })
        .from(marketplaceListings)
        .where(eq(marketplaceListings.eshte_aprovuar, true)),
    ])

    return {
      organizationsCount: orgs[0]?.value ?? 0,
      articlesCount: articlesCount[0]?.value ?? 0,
      usersCount: userCount[0]?.value ?? 0,
      listingsCount: listings[0]?.value ?? 0,
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

  try {
    const rows = await db
      .get()
      .select({
        article: articles,
        author_name: users.emri_i_plote,
      })
      .from(articles)
      .leftJoin(users, eq(articles.autori_id, users.id))
      .where(eq(articles.eshte_publikuar, true))
      .orderBy(desc(articles.created_at))
      .limit(limit)

    return rows.map(({ article, author_name }) => ({
      ...article,
      created_at: article.created_at.toISOString(),
      updated_at: article.updated_at ? article.updated_at.toISOString() : null,
      users: author_name ? { emri_i_plote: author_name } : null,
    }))
  } catch (error) {
    console.error("fetchLatestArticles error:", error)
    return []
  }
}

export async function fetchKeyPartners(limit = 5) {
  noStore()
  try {
    const partners = await db
      .get()
      .select()
      .from(organizations)
      .where(eq(organizations.eshte_aprovuar, true))
      .orderBy(desc(organizations.created_at))
      .limit(limit)

    return partners.map((partner) => ({
      ...partner,
      created_at: partner.created_at.toISOString(),
      updated_at: partner.updated_at ? partner.updated_at.toISOString() : null,
    }))
  } catch (error) {
    console.error("fetchKeyPartners error:", error)
    return []
  }
}
