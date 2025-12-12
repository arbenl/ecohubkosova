import { unstable_noStore as noStore } from "next/cache"
import { and, asc, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import {
  organizationMembers,
  organizations,
  users,
  ecoListings,
  ecoCategories,
  ecoOrganizations,
} from "@/db/schema"
import { isMarketplaceV2WritesEnabled } from "@/lib/env"
import type { Listing } from "@/types"
import type { ListingCreateInput } from "@/validation/listings"
import type { ListingListOptions, ListingsQueryResult, ListingMutationResult } from "./types"
import { formatListingRow, formatPrice, mapFlowType } from "./mapper"

const ITEMS_PER_PAGE = 12
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isValidUuid = (value: string) => UUID_REGEX.test(value.trim())

const warnIfV2FlagDisabled = () => {
  if (!isMarketplaceV2WritesEnabled()) {
    console.warn(
      "[marketplace] USE_MARKETPLACE_V2_WRITES is false, but V1 write path is retired. Continuing with eco_listings."
    )
  }
}

async function findApprovedEcoOrganizationId(userId: string) {
  const memberships = await db
    .get()
    .select({
      organization_id: organizationMembers.organization_id,
    })
    .from(organizationMembers)
    .where(and(eq(organizationMembers.user_id, userId), eq(organizationMembers.is_approved, true)))
    .limit(1)

  const orgId = memberships[0]?.organization_id
  if (!orgId) return null

  const ecoOrg = await db
    .get()
    .select({ id: ecoOrganizations.id })
    .from(ecoOrganizations)
    .where(eq(ecoOrganizations.organization_id, orgId))
    .limit(1)

  return ecoOrg[0]?.id ?? null
}

async function resolveCategoryId(categoryInput: string | null | undefined) {
  if (!categoryInput) return null
  const normalized = categoryInput.trim().toLowerCase()
  const slug = normalized.replace(/\s+/g, "-")

  const match = await db
    .get()
    .select({ id: ecoCategories.id })
    .from(ecoCategories)
    .where(
      or(
        eq(ecoCategories.slug, slug),
        ilike(ecoCategories.name_en, `%${normalized}%`),
        ilike(ecoCategories.name_sq, `%${normalized}%`)
      )
    )
    .limit(1)

  if (match[0]?.id) return match[0].id

  const fallback = await db
    .get()
    .select({ id: ecoCategories.id })
    .from(ecoCategories)
    .orderBy(asc(ecoCategories.sort_order), asc(ecoCategories.name_en))
    .limit(1)

  return fallback[0]?.id ?? null
}

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
  flowType,
  search = "",
  category = "all",
  page = 1,
  pageSize = ITEMS_PER_PAGE,
  condition = "",
  location = "",
  tag = "",
  sort = "newest",
  locale,
}: ListingListOptions): Promise<ListingsQueryResult> {
  noStore()

  try {
    const normalizedPage = Number.isFinite(page) && page > 0 ? page : 1
    const limit = Math.max(1, Math.min(pageSize, 100))
    const offset = (normalizedPage - 1) * limit
    const filters: SQL[] = [eq(ecoListings.status, "ACTIVE"), eq(ecoListings.visibility, "PUBLIC")]

    if (type && type !== "te-gjitha") {
      if (type === "shes") {
        filters.push(sql`${ecoListings.flow_type}::text ILIKE 'OFFER%'`)
      } else if (type === "blej") {
        filters.push(sql`${ecoListings.flow_type}::text ILIKE 'REQUEST%'`)
      } else if (type === "sherbime") {
        filters.push(sql`${ecoListings.flow_type}::text ILIKE 'SERVICE%'`)
      }
    }

    // Direct flow type filter (comma separated)
    if (flowType) {
      const flowTypes = flowType
        .split(",")
        .map((ft) => ft.trim())
        .filter(Boolean)
      if (flowTypes.length === 1) {
        filters.push(eq(ecoListings.flow_type, flowTypes[0] as any))
      } else if (flowTypes.length > 1) {
        const flowTypeClause = inArray(ecoListings.flow_type, flowTypes as any[])
        if (flowTypeClause) {
          filters.push(flowTypeClause)
        }
      }
    }

    if (search.trim()) {
      const searchFilter = or(
        ilike(ecoListings.title, `%${search.trim()}%`),
        ilike(ecoListings.description, `%${search.trim()}%`)
      )
      if (searchFilter) {
        filters.push(searchFilter)
      }
    }

    if (category && category !== "all") {
      if (isValidUuid(category)) {
        filters.push(eq(ecoListings.category_id, category as any))
      } else {
        filters.push(eq(ecoCategories.slug, category))
      }
    }

    if (condition.trim()) {
      filters.push(eq(ecoListings.condition, condition.trim() as any))
    }

    if (location.trim()) {
      const locationFilter = or(
        ilike(ecoListings.city, `%${location.trim()}%`),
        ilike(ecoListings.region, `%${location.trim()}%`)
      )
      if (locationFilter) {
        filters.push(locationFilter)
      }
    }

    // Filter by eco_label tag (checks if tag is contained in eco_labels array)
    if (tag.trim()) {
      // PostgreSQL array contains operator: eco_labels @> ARRAY['tag']
      filters.push(sql`${ecoListings.eco_labels} @> ARRAY[${tag.trim().toUpperCase()}]::text[]`)
    }

    const whereClause = filters.length === 1 ? filters[0] : and(...filters)

    const rows = await db
      .get()
      .select({
        listing: ecoListings,
        category_name_en: ecoCategories.name_en,
        category_name_sq: ecoCategories.name_sq,
        organization_name: organizations.name,
        organization_email: organizations.contact_email,
        organization_phone: organizations.contact_phone, // Added: normalized field
        organization_website: organizations.contact_website, // Added: normalized field
        organization_contact_person: organizations.contact_person,
        organization_metadata: ecoOrganizations.metadata, // Deprecated: for backward compatibility
        owner_name: users.full_name,
        owner_email: users.email,
      })
      .from(ecoListings)
      .leftJoin(ecoCategories, eq(ecoListings.category_id, ecoCategories.id))
      .leftJoin(ecoOrganizations, eq(ecoListings.organization_id, ecoOrganizations.id))
      .leftJoin(organizations, eq(ecoOrganizations.organization_id, organizations.id))
      .leftJoin(users, eq(ecoListings.created_by_user_id, users.id))
      .where(whereClause)
      .orderBy(sort === "oldest" ? asc(ecoListings.created_at) : desc(ecoListings.created_at))
      .limit(limit + 1)
      .offset(offset)

    const hasMore = rows.length > limit
    const list = rows.slice(0, limit).map(formatListingRow)

    return {
      data: list,
      hasMore,
      error: null,
    }
  } catch (error) {
    console.error("[fetchListings] Query failed:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
      fullError: error,
    })
    const errorMessage =
      error instanceof Error ? error.message : "Gabim gjatë ngarkimit të listimeve."
    return {
      data: [],
      hasMore: false,
      error: errorMessage,
    }
  }
}

/**
 * Fetch all listings for a specific user, including DRAFT and ARCHIVED.
 * Used for "My Listings" page.
 */
export async function fetchUserListings(userId: string): Promise<ListingsQueryResult> {
  noStore()

  try {
    const rows = await db
      .get()
      .select({
        listing: ecoListings,
        category_name_en: ecoCategories.name_en,
        category_name_sq: ecoCategories.name_sq,
        organization_name: organizations.name,
        organization_email: organizations.contact_email,
        organization_phone: organizations.contact_phone,
        organization_website: organizations.contact_website,
        organization_contact_person: organizations.contact_person,
        organization_metadata: ecoOrganizations.metadata,
        owner_name: users.full_name,
        owner_email: users.email,
      })
      .from(ecoListings)
      .leftJoin(ecoCategories, eq(ecoListings.category_id, ecoCategories.id))
      .leftJoin(ecoOrganizations, eq(ecoListings.organization_id, ecoOrganizations.id))
      .leftJoin(organizations, eq(ecoOrganizations.organization_id, organizations.id))
      .leftJoin(users, eq(ecoListings.created_by_user_id, users.id))
      .where(eq(ecoListings.created_by_user_id, userId))
      .orderBy(desc(ecoListings.updated_at), desc(ecoListings.created_at))

    const list = rows.map(formatListingRow)

    return {
      data: list,
      hasMore: false,
      error: null,
    }
  } catch (error) {
    console.error("[fetchUserListings] Query failed:", error)
    return {
      data: [],
      hasMore: false,
      error: "Gabim gjatë ngarkimit të listimeve tuaja.",
    }
  }
}

/**
 * Fetch a single listing by ID.
 * V2 Migration: Now queries eco_listings (V2) instead of tregu_listime (V1)
 * Only returns ACTIVE + PUBLIC listings.
 * Includes organization contact info when available.
 */
export async function fetchListingById(id: string) {
  noStore()

  try {
    const records = await db
      .get()
      .select({
        listing: ecoListings,
        category_name_en: ecoCategories.name_en,
        category_name_sq: ecoCategories.name_sq,
        organization_name: organizations.name,
        organization_contact_email: organizations.contact_email,
        organization_contact_phone: organizations.contact_phone, // Added: normalized field
        organization_contact_website: organizations.contact_website, // Added: normalized field
        organization_contact_person: organizations.contact_person,
        organization_metadata: ecoOrganizations.metadata, // Deprecated: for backward compatibility
        owner_name: users.full_name,
        owner_email: users.email,
      })
      .from(ecoListings)
      .leftJoin(ecoCategories, eq(ecoListings.category_id, ecoCategories.id))
      .leftJoin(ecoOrganizations, eq(ecoListings.organization_id, ecoOrganizations.id))
      .leftJoin(organizations, eq(ecoOrganizations.organization_id, organizations.id))
      .leftJoin(users, eq(ecoListings.created_by_user_id, users.id))
      .where(
        and(
          eq(ecoListings.id, id),
          eq(ecoListings.status, "ACTIVE"),
          eq(ecoListings.visibility, "PUBLIC")
        )
      )
      .limit(1)

    const record = records[0]

    if (!record) {
      return {
        data: null,
        error: "Listimi nuk u gjet ose nuk është i aprovuar.",
      }
    }

    // Use normalized contact fields from organizations table (no metadata parsing needed)
    const organization_contact_phone = record.organization_contact_phone || null
    const organization_contact_website = record.organization_contact_website || null
    const organization_contact_person = record.organization_contact_person || null

    // Map V2 data to V1 Listing type for backward compatibility
    const listing: Listing = {
      id: record.listing.id,
      title: record.listing.title,
      description: record.listing.description || "",
      foto_url: null,
      price: record.listing.price ? Number(record.listing.price) : null,
      currency: record.listing.currency,
      category: record.category_name_sq || record.category_name_en || "",
      condition: record.listing.condition || "",
      location: [record.listing.city, record.listing.region].filter(Boolean).join(", "),
      contact: record.organization_contact_email || record.owner_email || "", // Use organization email if available
      created_at: record.listing.created_at.toISOString(),
      user_id: record.listing.created_by_user_id,
      is_published: true, // If it's ACTIVE and PUBLIC, it's published
      quantity: record.listing.quantity?.toString() || "",
      unit: record.listing.unit || "",
      listing_type: record.listing.flow_type?.startsWith("OFFER") ? "shes" : "blej",
      flow_type: record.listing.flow_type || undefined,
      pricing_type: record.listing.pricing_type,
      visibility: record.listing.visibility,
      status: record.listing.status,
      city: record.listing.city,
      region: record.listing.region,
      eco_labels: record.listing.eco_labels,
      tags: record.listing.tags,
      category_name_en: record.category_name_en,
      category_name_sq: record.category_name_sq,
      organization_id: record.listing.organization_id,
      organization_name: record.organization_name,
      organization_contact_email: record.organization_contact_email,
      organization_contact_phone,
      organization_contact_website,
      organization_contact_person,
      organizations: record.organization_name
        ? {
            name: record.organization_name,
            contact_email: record.organization_contact_email || "",
            contact_person: organization_contact_person || undefined,
          }
        : undefined,
      users: record.owner_name
        ? {
            full_name: record.owner_name,
            email: record.owner_email || undefined,
          }
        : undefined,
      creator_full_name: record.owner_name,
      creator_email: record.owner_email,
    }

    return { data: listing, error: null as string | null }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Listimi nuk u gjet ose nuk është i aprovuar."
    console.error("[fetchListingById] Query failed:", { id, error: errorMessage })
    return {
      data: null,
      error: errorMessage,
    }
  }
}

/**
 * Fetch a single listing by ID for the owner (edit page).
 * Returns listing regardless of status/visibility.
 * Enforces ownership - returns error if user is not the owner.
 */
export async function fetchListingByIdForOwner(listingId: string, userId: string) {
  noStore()

  try {
    const records = await db
      .get()
      .select({
        listing: ecoListings,
        category_name_en: ecoCategories.name_en,
        category_name_sq: ecoCategories.name_sq,
        organization_name: organizations.name,
        organization_contact_email: organizations.contact_email,
        organization_contact_phone: organizations.contact_phone,
        organization_contact_website: organizations.contact_website,
        organization_contact_person: organizations.contact_person,
        organization_metadata: ecoOrganizations.metadata,
        owner_name: users.full_name,
        owner_email: users.email,
      })
      .from(ecoListings)
      .leftJoin(ecoCategories, eq(ecoListings.category_id, ecoCategories.id))
      .leftJoin(ecoOrganizations, eq(ecoListings.organization_id, ecoOrganizations.id))
      .leftJoin(organizations, eq(ecoOrganizations.organization_id, organizations.id))
      .leftJoin(users, eq(ecoListings.created_by_user_id, users.id))
      .where(
        and(
          eq(ecoListings.id, listingId),
          eq(ecoListings.created_by_user_id, userId) // Ownership check
        )
      )
      .limit(1)

    const record = records[0]

    if (!record) {
      return {
        data: null,
        error: "NOT_FOUND",
      }
    }

    // Map to Listing type
    const listing: Listing = {
      id: record.listing.id,
      title: record.listing.title,
      description: record.listing.description || "",
      foto_url: null,
      price: record.listing.price ? Number(record.listing.price) : null,
      currency: record.listing.currency,
      category: record.category_name_sq || record.category_name_en || "",
      condition: record.listing.condition || "",
      location: [record.listing.city, record.listing.region].filter(Boolean).join(", "),
      contact: record.organization_contact_email || record.owner_email || "",
      created_at: record.listing.created_at.toISOString(),
      user_id: record.listing.created_by_user_id,
      is_published: record.listing.status === "ACTIVE" && record.listing.visibility === "PUBLIC",
      quantity: record.listing.quantity?.toString() || "",
      unit: record.listing.unit || "",
      listing_type: record.listing.flow_type?.startsWith("OFFER") ? "shes" : "blej",
      flow_type: record.listing.flow_type || undefined,
      pricing_type: record.listing.pricing_type,
      visibility: record.listing.visibility,
      status: record.listing.status,
      city: record.listing.city,
      region: record.listing.region,
      eco_labels: record.listing.eco_labels,
      tags: record.listing.tags,
      category_name_en: record.category_name_en,
      category_name_sq: record.category_name_sq,
      organization_id: record.listing.organization_id,
      organization_name: record.organization_name,
      organization_contact_email: record.organization_contact_email,
      organization_contact_phone: record.organization_contact_phone || null,
      organization_contact_website: record.organization_contact_website || null,
      organization_contact_person: record.organization_contact_person || null,
      organizations: record.organization_name
        ? {
            name: record.organization_name,
            contact_email: record.organization_contact_email || "",
            contact_person: record.organization_contact_person || undefined,
          }
        : undefined,
      users: record.owner_name
        ? {
            full_name: record.owner_name,
            email: record.owner_email || undefined,
          }
        : undefined,
      creator_full_name: record.owner_name,
      creator_email: record.owner_email,
    }

    return { data: listing, error: null }
  } catch (error) {
    console.error("[fetchListingByIdForOwner] Query failed:", { listingId, userId, error })
    return {
      data: null,
      error: "QUERY_ERROR",
    }
  }
}

export async function createUserListing(
  userId: string,
  payload: ListingCreateInput
): Promise<ListingMutationResult & { listingId?: string }> {
  warnIfV2FlagDisabled()

  const price = formatPrice(payload.price)
  if (price === null) {
    return { error: "Çmimi është i detyrueshëm dhe duhet të jetë numër pozitiv." }
  }

  try {
    const organizationId = await findApprovedEcoOrganizationId(userId)
    const categoryId = await resolveCategoryId(payload.category)

    if (!categoryId) {
      return { error: "Kategoria është e pavlefshme ose mungon." }
    }

    const quantityValue = payload.quantity ? Number.parseFloat(payload.quantity) : null
    const insertPayload: typeof ecoListings.$inferInsert = {
      created_by_user_id: userId,
      organization_id: organizationId,
      category_id: categoryId,
      title: payload.title,
      description: payload.description,
      flow_type: mapFlowType(payload.listing_type) as typeof ecoListings.$inferInsert.flow_type,
      condition: null,
      lifecycle_stage: null,
      price: price,
      currency: "EUR",
      pricing_type: "FIXED",
      unit: payload.unit || null,
      quantity: Number.isFinite(quantityValue) ? (quantityValue?.toString() ?? null) : null,
      country: "XK",
      city: payload.location || null,
      region: null,
      location_details: payload.location || null,
      eco_labels: [],
      tags: [],
      status: "ACTIVE",
      visibility: "PUBLIC",
      metadata: {},
    }

    const [inserted] = await db
      .get()
      .insert(ecoListings)
      .values(insertPayload)
      .returning({ id: ecoListings.id })

    return { success: true, listingId: inserted.id }
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
  warnIfV2FlagDisabled()

  const price = formatPrice(payload.price)
  if (price === null) {
    return { error: "Çmimi është i detyrueshëm dhe duhet të jetë numër pozitiv." }
  }

  try {
    const categoryId = await resolveCategoryId(payload.category)
    if (!categoryId) {
      return { error: "Kategoria është e pavlefshme ose mungon." }
    }

    const quantityValue = payload.quantity ? Number.parseFloat(payload.quantity) : null

    const updateResult = await db
      .get()
      .update(ecoListings)
      .set({
        title: payload.title,
        description: payload.description,
        category_id: categoryId,
        flow_type: mapFlowType(payload.listing_type) as typeof ecoListings.$inferInsert.flow_type,
        price: price,
        unit: payload.unit || null,
        quantity: Number.isFinite(quantityValue) ? (quantityValue?.toString() ?? null) : null,
        city: payload.location || null,
        location_details: payload.location || null,
        status: "ACTIVE",
        visibility: "PUBLIC",
        updated_at: new Date(),
      })
      .where(and(eq(ecoListings.id, listingId), eq(ecoListings.created_by_user_id, userId)))
      .returning({ id: ecoListings.id })

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

export async function deleteUserListing(
  listingId: string,
  userId: string
): Promise<ListingMutationResult> {
  warnIfV2FlagDisabled()

  try {
    const deleteResult = await db
      .get()
      .update(ecoListings)
      .set({ status: "ARCHIVED", visibility: "PRIVATE", updated_at: new Date() })
      .where(and(eq(ecoListings.id, listingId), eq(ecoListings.created_by_user_id, userId)))
      .returning({ id: ecoListings.id })

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
