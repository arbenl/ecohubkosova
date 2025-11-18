import { unstable_noStore as noStore } from "next/cache"
import { count, desc, eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { articles, marketplaceListings, organizations, users } from "@/db/schema"

// ============================================================================
// UTILITIES - Shared helpers
// ============================================================================

const isConnectionError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  return (
    message.includes("connection") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("pool") ||
    message.includes("timeout") ||
    message.includes("fatal") ||
    error.name === "PostgresError"
  )
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ============================================================================
// QUERY HELPER - Unified retry logic
// ============================================================================

const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 2
): Promise<T> => {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Don't retry non-connection errors
      if (!isConnectionError(error)) {
        throw error
      }

      // Don't retry if we've exhausted attempts
      if (attempt === maxRetries) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`[${operationName}] Failed after ${maxRetries + 1} attempts: ${errorMsg}`)
        throw error
      }

      // Exponential backoff: 100ms, 200ms, 400ms
      const delayMs = Math.pow(2, attempt) * 100
      console.warn(`[${operationName}] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`)
      await sleep(delayMs)
    }
  }

  throw lastError
}

// ============================================================================
// DATABASE QUERIES - Each gets fresh connection
// ============================================================================

async function fetchOrganizationsCount(): Promise<number> {
  return executeWithRetry(
    async () => {
      const result = await db
        .get() // Fresh connection
        .select({ value: count() })
        .from(organizations)
        .where(eq(organizations.is_approved, true))

      return result[0]?.value ?? 0
    },
    "fetchOrganizationsCount",
    2
  )
}

async function fetchArticlesCount(): Promise<number> {
  return executeWithRetry(
    async () => {
      const result = await db
        .get() // Fresh connection
        .select({ value: count() })
        .from(articles)
        .where(eq(articles.is_published, true))

      return result[0]?.value ?? 0
    },
    "fetchArticlesCount",
    2
  )
}

async function fetchUsersCount(): Promise<number> {
  return executeWithRetry(
    async () => {
      const result = await db
        .get() // Fresh connection
        .select({ value: count() })
        .from(users)

      return result[0]?.value ?? 0
    },
    "fetchUsersCount",
    2
  )
}

async function fetchListingsCount(): Promise<number> {
  return executeWithRetry(
    async () => {
      const result = await db
        .get() // Fresh connection
        .select({ value: count() })
        .from(marketplaceListings)
        .where(eq(marketplaceListings.is_approved, true))

      return result[0]?.value ?? 0
    },
    "fetchListingsCount",
    2
  )
}

// ============================================================================
// PUBLIC API - Dashboard stats aggregator
// ============================================================================

export async function fetchDashboardStats() {
  noStore()

  try {
    // Run all queries in parallel with proper error isolation
    // Each query retries independently
    const [organizationsCount, articlesCount, usersCount, listingsCount] = await Promise.allSettled(
      [
        fetchOrganizationsCount(),
        fetchArticlesCount(),
        fetchUsersCount(),
        fetchListingsCount(),
      ]
    ).then((results) =>
      results.map((result) =>
        result.status === "fulfilled" ? result.value : 0
      )
    )

    return {
      organizationsCount,
      articlesCount,
      usersCount,
      listingsCount,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[fetchDashboardStats] Critical error:", errorMsg)

    // Return zeros on complete failure
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

  return executeWithRetry(
    async () => {
      const rows = await db
        .get() // Fresh connection for this query
        .select({
          article: articles,
          author_name: users.full_name,
        })
        .from(articles)
        .leftJoin(users, eq(articles.author_id, users.id))
        .where(eq(articles.is_published, true))
        .orderBy(desc(articles.created_at))
        .limit(limit)

      return rows.map(({ article, author_name }) => ({
        ...article,
        created_at: article.created_at.toISOString(),
        updated_at: article.updated_at ? article.updated_at.toISOString() : null,
        users: author_name ? { full_name: author_name } : null,
      }))
    },
    "fetchLatestArticles",
    2
  ).catch((error) => {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[fetchLatestArticles] Failed:", errorMsg)
    return []
  })
}

export async function fetchKeyPartners(limit = 5) {
  noStore()

  return executeWithRetry(
    async () => {
      const partners = await db
        .get() // Fresh connection for this query
        .select()
        .from(organizations)
        .where(eq(organizations.is_approved, true))
        .orderBy(desc(organizations.created_at))
        .limit(limit)

      return partners.map((partner) => ({
        ...partner,
        created_at: partner.created_at.toISOString(),
        updated_at: partner.updated_at ? partner.updated_at.toISOString() : null,
      }))
    },
    "fetchKeyPartners",
    2
  ).catch((error) => {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[fetchKeyPartners] Failed:", errorMsg)
    return []
  })
}
