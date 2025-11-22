/**
 * Analytics Service - Marketplace & Organization Insights
 *
 * Provides reusable analytics helpers for aggregating interaction data
 * across listings and organizations. Used by dashboards and reporting.
 */

import { unstable_noStore as noStore } from "next/cache"
import { eq, and, gte, lte, count, sum, inArray } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { ecoListingInteractions, ecoListings } from "@/db/schema/marketplace-v2"

// ============================================================================
// TYPES
// ============================================================================

export interface ListingAnalytics {
  listingId: string
  listingTitle: string
  listingStatus: string
  totalViews: number
  totalContacts: number
  totalSaves: number
  totalShares: number
}

export interface OrganizationAnalytics {
  organizationId: string
  totals: {
    views: number
    contacts: number
    saves: number
    shares: number
  }
  listings: ListingAnalytics[]
}

export interface UserAnalytics {
  userId: string
  totals: {
    views: number
    contacts: number
    saves: number
    shares: number
  }
  topListings: Array<ListingAnalytics & { views: number }>
}

export interface AnalyticsOptions {
  since?: Date
}

// ============================================================================
// HELPERS - Interaction Aggregation
// ============================================================================

/**
 * Get analytics for a single listing
 */
export async function getListingAnalytics(
  listingId: string,
  options?: AnalyticsOptions
): Promise<{ data: ListingAnalytics | null; error: string | null }> {
  noStore()

  try {
    // Get listing details
    const listing = await db
      .get()
      .select({
        id: ecoListings.id,
        title: ecoListings.title,
        status: ecoListings.status,
      })
      .from(ecoListings)
      .where(eq(ecoListings.id, listingId))
      .limit(1)

    if (!listing || listing.length === 0) {
      return { data: null, error: "Listing not found" }
    }

    // Build conditions for interactions
    const conditions = [eq(ecoListingInteractions.listing_id, listingId)]
    if (options?.since) {
      conditions.push(gte(ecoListingInteractions.created_at, options.since))
    }

    // Aggregate interactions by type
    const interactions = await db
      .get()
      .select({
        type: ecoListingInteractions.interaction_type,
        count: count(),
      })
      .from(ecoListingInteractions)
      .where(and(...conditions))
      .groupBy(ecoListingInteractions.interaction_type)

    // Map results
    const analytics: ListingAnalytics = {
      listingId,
      listingTitle: listing[0].title,
      listingStatus: listing[0].status,
      totalViews: 0,
      totalContacts: 0,
      totalSaves: 0,
      totalShares: 0,
    }

    interactions.forEach((row) => {
      if (row.type === "VIEW") analytics.totalViews = row.count
      if (row.type === "CONTACT") analytics.totalContacts = row.count
      if (row.type === "SAVE") analytics.totalSaves = row.count
      if (row.type === "SHARE") analytics.totalShares = row.count
    })

    return { data: analytics, error: null }
  } catch (error) {
    console.error("[analytics] getListingAnalytics error:", error)
    return { data: null, error: "Failed to fetch listing analytics" }
  }
}

/**
 * Get analytics for all listings of an organization
 */
export async function getOrganizationAnalytics(
  organizationId: string,
  options?: AnalyticsOptions
): Promise<{ data: OrganizationAnalytics | null; error: string | null }> {
  noStore()

  try {
    // Get all listings for this organization
    const listings = await db
      .get()
      .select({
        id: ecoListings.id,
        title: ecoListings.title,
        status: ecoListings.status,
      })
      .from(ecoListings)
      .where(eq(ecoListings.organization_id, organizationId))

    if (listings.length === 0) {
      return {
        data: {
          organizationId,
          totals: { views: 0, contacts: 0, saves: 0, shares: 0 },
          listings: [],
        },
        error: null,
      }
    }

    const listingIds = listings.map((l) => l.id)

    // Build conditions for interactions
    const conditions: any[] = [inArray(ecoListingInteractions.listing_id, listingIds)]

    if (options?.since) {
      conditions.push(gte(ecoListingInteractions.created_at, options.since))
    }

    const whereClause = and(...conditions)

    // Get all interactions for these listings
    const allInteractions = await db
      .get()
      .select({
        listingId: ecoListingInteractions.listing_id,
        type: ecoListingInteractions.interaction_type,
        count: count(),
      })
      .from(ecoListingInteractions)
      .where(whereClause)
      .groupBy(ecoListingInteractions.listing_id, ecoListingInteractions.interaction_type)

    // Build listing analytics
    const listingMap = new Map(listings.map((l) => [l.id, l]))
    const listingAnalytics: ListingAnalytics[] = listings.map((listing) => ({
      listingId: listing.id,
      listingTitle: listing.title,
      listingStatus: listing.status,
      totalViews: 0,
      totalContacts: 0,
      totalSaves: 0,
      totalShares: 0,
    }))

    // Fill in interaction counts
    allInteractions.forEach((row) => {
      const analytics = listingAnalytics.find((a) => a.listingId === row.listingId)
      if (analytics) {
        if (row.type === "VIEW") analytics.totalViews = row.count
        if (row.type === "CONTACT") analytics.totalContacts = row.count
        if (row.type === "SAVE") analytics.totalSaves = row.count
        if (row.type === "SHARE") analytics.totalShares = row.count
      }
    })

    // Calculate totals
    const totals = {
      views: listingAnalytics.reduce((sum, l) => sum + l.totalViews, 0),
      contacts: listingAnalytics.reduce((sum, l) => sum + l.totalContacts, 0),
      saves: listingAnalytics.reduce((sum, l) => sum + l.totalSaves, 0),
      shares: listingAnalytics.reduce((sum, l) => sum + l.totalShares, 0),
    }

    return {
      data: {
        organizationId,
        totals,
        listings: listingAnalytics.sort((a, b) => b.totalViews - a.totalViews),
      },
      error: null,
    }
  } catch (error) {
    console.error("[analytics] getOrganizationAnalytics error:", error)
    return { data: null, error: "Failed to fetch organization analytics" }
  }
}

/**
 * Get analytics for listings created by a user
 */
export async function getUserAnalytics(
  userId: string,
  options?: AnalyticsOptions
): Promise<{ data: UserAnalytics | null; error: string | null }> {
  noStore()

  try {
    // Get all listings created by this user
    const listings = await db
      .get()
      .select({
        id: ecoListings.id,
        title: ecoListings.title,
        status: ecoListings.status,
      })
      .from(ecoListings)
      .where(eq(ecoListings.created_by_user_id, userId))

    if (listings.length === 0) {
      return {
        data: {
          userId,
          totals: { views: 0, contacts: 0, saves: 0, shares: 0 },
          topListings: [],
        },
        error: null,
      }
    }

    const listingIds = listings.map((l) => l.id)

    // Get all interactions for these listings
    const conditions: any[] = [inArray(ecoListingInteractions.listing_id, listingIds)]

    if (options?.since) {
      conditions.push(gte(ecoListingInteractions.created_at, options.since))
    }

    const whereClause = and(...conditions)

    const allInteractions = await db
      .get()
      .select({
        listingId: ecoListingInteractions.listing_id,
        type: ecoListingInteractions.interaction_type,
        count: count(),
      })
      .from(ecoListingInteractions)
      .where(whereClause)
      .groupBy(ecoListingInteractions.listing_id, ecoListingInteractions.interaction_type)

    // Build listing analytics
    const listingAnalytics: Array<ListingAnalytics & { views: number }> = listings.map((listing) => ({
      listingId: listing.id,
      listingTitle: listing.title,
      listingStatus: listing.status,
      totalViews: 0,
      totalContacts: 0,
      totalSaves: 0,
      totalShares: 0,
      views: 0,
    }))

    // Fill in interaction counts
    allInteractions.forEach((row) => {
      const analytics = listingAnalytics.find((a) => a.listingId === row.listingId)
      if (analytics) {
        if (row.type === "VIEW") {
          analytics.totalViews = row.count
          analytics.views = row.count
        }
        if (row.type === "CONTACT") analytics.totalContacts = row.count
        if (row.type === "SAVE") analytics.totalSaves = row.count
        if (row.type === "SHARE") analytics.totalShares = row.count
      }
    })

    // Calculate totals
    const totals = {
      views: listingAnalytics.reduce((sum, l) => sum + l.totalViews, 0),
      contacts: listingAnalytics.reduce((sum, l) => sum + l.totalContacts, 0),
      saves: listingAnalytics.reduce((sum, l) => sum + l.totalSaves, 0),
      shares: listingAnalytics.reduce((sum, l) => sum + l.totalShares, 0),
    }

    // Get top 5 by views
    const topListings = listingAnalytics
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)

    return {
      data: {
        userId,
        totals,
        topListings,
      },
      error: null,
    }
  } catch (error) {
    console.error("[analytics] getUserAnalytics error:", error)
    return { data: null, error: "Failed to fetch user analytics" }
  }
}

/**
 * Helper to get date for time range
 */
export function getDateForRange(range: "last30Days" | "last90Days" | "allTime"): Date | undefined {
  const now = new Date()

  if (range === "last30Days") {
    const date = new Date(now)
    date.setDate(date.getDate() - 30)
    return date
  }

  if (range === "last90Days") {
    const date = new Date(now)
    date.setDate(date.getDate() - 90)
    return date
  }

  // allTime returns undefined (no filter)
  return undefined
}
