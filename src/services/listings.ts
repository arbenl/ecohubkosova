import { unstable_noStore as noStore } from "next/cache"
import { and, asc, desc, eq, ilike } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { marketplaceListings, organizationMembers, organizations, users } from "@/db/schema"
import type { Listing } from "@/types"
import type { ListingCreateInput } from "@/validation/listings"

const ITEMS_PER_PAGE = 9

export interface ListingListOptions {
  type?: string
  search?: string
  category?: string
  page?: number
  condition?: string
  location?: string
  sort?: "newest" | "oldest"
}

/**
 * Result type for listing queries.
 * Follows the pattern from profile-service: typed result with error handling.
 */
export interface ListingsQueryResult {
  data: Listing[]
  hasMore: boolean
  error: string | null
}

type ListingRow = {
  listing: typeof marketplaceListings.$inferSelect
  owner_name: string | null
  owner_email: string | null
  organization_name: string | null
  organization_email: string | null
}

/**
 * Format a database row into a Listing object.
 * Maps database columns (including gjendja) to the Listing type.
 */
const formatListingRow = (row: ListingRow): Listing => ({
  id: row.listing.id,
  title: row.listing.title,
  description: row.listing.description,
  foto_url: null,
  price: Number(row.listing.price),
  currency: null,
  category: row.listing.category,
  condition: row.listing.gjendja ?? "", // Map gjendja column to condition field
  location: row.listing.location,
  contact: row.organization_email ?? row.owner_email ?? "",
  created_at: row.listing.created_at.toISOString(),
  user_id: row.listing.created_by_user_id,
  is_published: row.listing.is_approved,
  users: row.owner_name
    ? {
        full_name: row.owner_name,
        email: row.owner_email ?? undefined,
      }
    : undefined,
  organizations: row.organization_name
    ? {
        name: row.organization_name,
        contact_email: row.organization_email ?? undefined,
      }
    : undefined,
  quantity: row.listing.quantity,
  unit: row.listing.unit,
  listing_type: row.listing.listing_type as "shes" | "blej",
})

/**
 * Fetch marketplace listings with filtering, searching, and pagination.
 * 
 * Supports:
 * - Filtering by type (shes/blej or te-gjitha for all)
 * - Text search in title
 * - Category filtering
 * - Condition filtering (gjendja column)
 * - Location filtering
 * - Sorting by newest/oldest
 * - Pagination
 * 
 * Returns typed result with data, pagination flag, and optional error.
 * No profile required to view listings.
 */
export async function fetchListings({
  type = "te-gjitha",
  search = "",
  category = "all",
  page = 1,
  condition = "",
  location = "",
  sort = "newest",
}: ListingListOptions): Promise<ListingsQueryResult> {
  noStore()

  try {
    const offset = (page - 1) * ITEMS_PER_PAGE
    const filters = [eq(marketplaceListings.is_approved, true)]

    if (type && type !== "te-gjitha") {
      filters.push(eq(marketplaceListings.listing_type, type))
    }

    if (search.trim()) {
      filters.push(ilike(marketplaceListings.title, `%${search.trim()}%`))
    }

    if (category !== "all") {
      filters.push(eq(marketplaceListings.category, category))
    }

    // Use proper Drizzle column reference for gjendja instead of raw SQL
    if (condition.trim()) {
      filters.push(eq(marketplaceListings.gjendja, condition.trim()))
    }

    if (location.trim()) {
      filters.push(ilike(marketplaceListings.location, `%${location.trim()}%`))
    }

    const whereClause = filters.length === 1 ? filters[0] : and(...filters)

    const rows = await db
      .get()
      .select({
        listing: marketplaceListings,
        owner_name: users.full_name,
        owner_email: users.email,
        organization_name: organizations.name,
        organization_email: organizations.contact_email,
      })
      .from(marketplaceListings)
      .leftJoin(users, eq(marketplaceListings.created_by_user_id, users.id))
      .leftJoin(organizations, eq(marketplaceListings.organization_id, organizations.id))
      .where(whereClause)
      .orderBy(sort === "oldest" ? asc(marketplaceListings.created_at) : desc(marketplaceListings.created_at))
      .limit(ITEMS_PER_PAGE + 1)
      .offset(offset)

    const hasMore = rows.length > ITEMS_PER_PAGE
    const list = rows.slice(0, ITEMS_PER_PAGE).map(formatListingRow)

    return {
      data: list,
      hasMore,
      error: null,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Gabim gjatë ngarkimit të listimeve."
    console.error("[fetchListings] Query failed:", {
      error: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error,
    })
    return {
      data: [],
      hasMore: false,
      error: errorMessage,
    }
  }
}

/**
 * Fetch a single listing by ID.
 * Only returns approved listings.
 */
export async function fetchListingById(id: string) {
  noStore()

  try {
    const records = await db
      .get()
      .select({
        listing: marketplaceListings,
        owner_name: users.full_name,
        owner_email: users.email,
        organization_name: organizations.name,
        organization_email: organizations.contact_email,
      })
      .from(marketplaceListings)
      .leftJoin(users, eq(marketplaceListings.created_by_user_id, users.id))
      .leftJoin(organizations, eq(marketplaceListings.organization_id, organizations.id))
      .where(eq(marketplaceListings.id, id))
      .limit(1)
    const record = records[0]

    if (!record) {
      throw new Error("Listimi nuk u gjet ose nuk është i aprovuar.")
    }

    return { data: formatListingRow(record), error: null as string | null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Listimi nuk u gjet ose nuk është i aprovuar."
    console.error("[fetchListingById] Query failed:", { id, error: errorMessage })
    return {
      data: null,
      error: errorMessage,
    }
  }
}

// ============================================================================
// MUTATION FUNCTIONS - Create, Update, Delete
// ============================================================================

type ListingMutationResult = { success: true } | { error: string }

const formatPrice = (value: ListingCreateInput["price"]) => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value.toFixed(2)
  }
  return null
}

async function findApprovedOrganizationId(userId: string) {
  const memberships = await db
    .get()
    .select({ organization_id: organizationMembers.organization_id })
    .from(organizationMembers)
    .where(and(eq(organizationMembers.user_id, userId), eq(organizationMembers.is_approved, true)))
    .limit(1)
  const membership = memberships[0]

  return membership?.organization_id ?? null
}

export async function createUserListing(userId: string, payload: ListingCreateInput): Promise<ListingMutationResult> {
  const price = formatPrice(payload.price)
  if (price === null) {
    return { error: "Çmimi është i detyrueshëm dhe duhet të jetë numër pozitiv." }
  }

  try {
    const organizationId = await findApprovedOrganizationId(userId)
    const now = new Date()

    await db
      .get()
      .insert(marketplaceListings)
      .values({
        created_by_user_id: userId,
        organization_id: organizationId,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        price: price,
        unit: payload.unit,
        location: payload.location,
        quantity: payload.quantity,
        listing_type: payload.listing_type,
        is_approved: false,
        created_at: now,
        updated_at: now,
      })

    return { success: true }
  } catch (error) {
    console.error("[createUserListing] Failed:", error)
    return { error: "Gabim gjatë shtimit të listimit. Ju lutemi provoni përsëri." }
  }
}

export async function updateUserListing(
  listingId: string,
  userId: string,
  payload: ListingCreateInput
): Promise<ListingMutationResult> {
  const price = formatPrice(payload.price)
  if (price === null) {
    return { error: "Çmimi është i detyrueshëm dhe duhet të jetë numër pozitiv." }
  }

  try {
    const updateResult = await db
      .get()
      .update(marketplaceListings)
      .set({
        title: payload.title,
        description: payload.description,
        category: payload.category,
        price: price,
        unit: payload.unit,
        location: payload.location,
        quantity: payload.quantity,
        listing_type: payload.listing_type,
        is_approved: false,
        updated_at: new Date(),
      })
      .where(and(eq(marketplaceListings.id, listingId), eq(marketplaceListings.created_by_user_id, userId)))
      .returning({ id: marketplaceListings.id })

    const updated = updateResult?.[0]

    if (!updated) {
      return { error: "Listimi nuk u gjet ose nuk keni të drejta ta ndryshoni." }
    }

    return { success: true }
  } catch (error) {
    console.error("[updateUserListing] Failed:", error)
    return { error: "Gabim gjatë përditësimit të listimit. Ju lutemi provoni përsëri." }
  }
}

export async function deleteUserListing(listingId: string, userId: string): Promise<ListingMutationResult> {
  try {
    const deleteResult = await db
      .get()
      .delete(marketplaceListings)
      .where(and(eq(marketplaceListings.id, listingId), eq(marketplaceListings.created_by_user_id, userId)))
      .returning({ id: marketplaceListings.id })

    const deleted = deleteResult?.[0]

    if (!deleted) {
      return { error: "Listimi nuk u gjet ose nuk keni të drejta ta fshini." }
    }

    return { success: true }
  } catch (error) {
    console.error("[deleteUserListing] Failed:", error)
    return { error: "Gabim gjatë fshirjes së listimit. Ju lutemi provoni përsëri." }
  }
}
