/**
 * Marketplace Interactions Service
 * Handles aggregation and queries for listing interactions (views, saves, contacts, shares)
 */

import { eq, and, count } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { ecoListingInteractions, ecoListings } from "@/db/schema"

export interface ListingInteractionCounts {
  views: number
  saves: number
  contacts: number
  shares: number
}

/**
 * Get aggregated interaction counts for a listing
 */
export async function getListingInteractionCounts(
  listingId: string
): Promise<ListingInteractionCounts> {
  try {
    const result = await db
      .get()
      .select({
        type: ecoListingInteractions.interaction_type,
        count: count(ecoListingInteractions.id),
      })
      .from(ecoListingInteractions)
      .where(eq(ecoListingInteractions.listing_id, listingId))
      .groupBy(ecoListingInteractions.interaction_type)

    const counts: ListingInteractionCounts = {
      views: 0,
      saves: 0,
      contacts: 0,
      shares: 0,
    }

    result.forEach((row) => {
      if (row.type === "VIEW") counts.views = Number(row.count)
      else if (row.type === "SAVE") counts.saves = Number(row.count)
      else if (row.type === "CONTACT") counts.contacts = Number(row.count)
      else if (row.type === "SHARE") counts.shares = Number(row.count)
    })

    return counts
  } catch (error) {
    console.error("[interactions-service] Failed to get counts:", error)
    return { views: 0, saves: 0, contacts: 0, shares: 0 }
  }
}

/**
 * Check if a listing is saved by a specific user
 */
export async function isListingSavedByUser(
  listingId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await db
      .get()
      .select({ id: ecoListingInteractions.id })
      .from(ecoListingInteractions)
      .where(
        and(
          eq(ecoListingInteractions.listing_id, listingId),
          eq(ecoListingInteractions.user_id, userId),
          eq(ecoListingInteractions.interaction_type, "SAVE")
        )
      )
      .limit(1)

    return result.length > 0
  } catch (error) {
    console.error("[interactions-service] Failed to check if saved:", error)
    return false
  }
}

/**
 * Get all saved listings for a user (with pagination)
 */
export async function getSavedListings(
  userId: string,
  limit: number = 12,
  offset: number = 0
) {
  try {
    const rows = await db
      .get()
      .select({
        interaction: ecoListingInteractions,
        listing: ecoListings,
      })
      .from(ecoListingInteractions)
      .innerJoin(ecoListings, eq(ecoListingInteractions.listing_id, ecoListings.id))
      .where(
        and(
          eq(ecoListingInteractions.user_id, userId),
          eq(ecoListingInteractions.interaction_type, "SAVE")
        )
      )
      .orderBy(ecoListingInteractions.created_at)
      .limit(limit)
      .offset(offset)

    const total = await db
      .get()
      .select({ count: count(ecoListingInteractions.id) })
      .from(ecoListingInteractions)
      .where(
        and(
          eq(ecoListingInteractions.user_id, userId),
          eq(ecoListingInteractions.interaction_type, "SAVE")
        )
      )

    return {
      listings: rows.map((r) => r.listing),
      total: Number(total[0]?.count) || 0,
    }
  } catch (error) {
    console.error("[interactions-service] Failed to get saved listings:", error)
    return { listings: [], total: 0 }
  }
}

/**
 * Record a VIEW interaction for a listing
 * (Called when user visits listing detail page)
 */
export async function recordView(listingId: string, userId: string | null) {
  if (!userId) return

  try {
    await db
      .get()
      .insert(ecoListingInteractions)
      .values({
        listing_id: listingId,
        user_id: userId,
        interaction_type: "VIEW",
      })
      .onConflictDoNothing() // Allow multiple views
  } catch (error) {
    console.error("[interactions-service] Failed to record view:", error)
  }
}
