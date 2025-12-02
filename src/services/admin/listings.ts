// NOTE: Admin listing operations now use eco_listings (V2) only. Legacy tregu_listime is retained in schema for archival purposes.

import { asc, desc, eq, ilike, inArray, or } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { ecoCategories, ecoListings } from "@/db/schema"
import { isMarketplaceV2WritesEnabled } from "@/lib/env"
import type { AdminListingUpdateInput } from "@/validation/admin"
export type { AdminListingUpdateInput } from "@/validation/admin"

export interface AdminListing {
  id: string
  created_by_user_id: string
  organization_id: string | null
  title: string
  description: string
  category: string
  price: number
  unit: string
  location: string
  quantity: string
  listing_type: string
  is_approved: boolean
  created_at: string
  updated_at: string | null
}

type AdminListingRow = {
  listing: typeof ecoListings.$inferSelect
  category_name_sq: string | null
  category_name_en: string | null
}

const toError = (error: unknown) =>
  error instanceof Error
    ? error
    : new Error(typeof error === "string" ? error : "Gabim i panjohur.")

const warnIfV2FlagDisabled = () => {
  if (!isMarketplaceV2WritesEnabled()) {
    console.warn(
      "[AdminListings] USE_MARKETPLACE_V2_WRITES is false, but admin operates on eco_listings only."
    )
  }
}

const mapFlowType = (listingType: string) =>
  listingType === "shes" ? "OFFER_MATERIAL" : "REQUEST_MATERIAL"

const mapListingType = (flowType?: string | null) =>
  flowType && flowType.toString().startsWith("OFFER") ? "shes" : "blej"

const resolveCategoryId = async (categoryInput: string | null | undefined) => {
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

const formatAdminListing = (row: AdminListingRow): AdminListing => {
  const quantityValue =
    row.listing.quantity !== null && row.listing.quantity !== undefined
      ? row.listing.quantity.toString()
      : ""
  const priceValue =
    row.listing.price !== null && row.listing.price !== undefined ? Number(row.listing.price) : 0
  const listingType = mapListingType(row.listing.flow_type)
  const locationParts = [row.listing.city, row.listing.region, row.listing.location_details].filter(
    Boolean
  )

  return {
    id: row.listing.id,
    created_by_user_id: row.listing.created_by_user_id,
    organization_id: row.listing.organization_id ?? null,
    title: row.listing.title,
    description: row.listing.description,
    category: row.category_name_sq || row.category_name_en || "",
    price: priceValue,
    unit: row.listing.unit || "",
    location: locationParts.join(", "),
    quantity: quantityValue,
    listing_type: listingType,
    is_approved: row.listing.status === "ACTIVE",
    created_at: row.listing.created_at.toISOString(),
    updated_at: row.listing.updated_at ? row.listing.updated_at.toISOString() : null,
  }
}

export async function fetchAdminListings() {
  try {
    const rows = await db
      .get()
      .select({
        listing: ecoListings,
        category_name_sq: ecoCategories.name_sq,
        category_name_en: ecoCategories.name_en,
      })
      .from(ecoListings)
      .leftJoin(ecoCategories, eq(ecoListings.category_id, ecoCategories.id))
      .where(
        inArray(ecoListings.status, ["ACTIVE", "DRAFT", "SOLD", "FULFILLED", "REJECTED"] as any[])
      )
      .orderBy(desc(ecoListings.created_at))

    return { data: rows.map(formatAdminListing), error: null }
  } catch (error) {
    console.error("[services/admin/listings] Failed to fetch listings:", error)
    return { data: null, error: toError(error) }
  }
}

export async function deleteListingRecord(listingId: string) {
  warnIfV2FlagDisabled()

  try {
    const result = await db
      .get()
      .update(ecoListings)
      .set({ status: "ARCHIVED", visibility: "PRIVATE", updated_at: new Date() })
      .where(eq(ecoListings.id, listingId))
      .returning({ id: ecoListings.id })

    if (!result[0]?.id) {
      return { error: new Error("Listimi nuk u gjet.") }
    }

    return { error: null }
  } catch (error) {
    console.error("[services/admin/listings] Failed to delete listing:", error)
    return { error: toError(error) }
  }
}

export async function fetchPendingAdminListings(limit = 5) {
  try {
    const rows = await db
      .get()
      .select({
        listing: ecoListings,
        category_name_sq: ecoCategories.name_sq,
        category_name_en: ecoCategories.name_en,
      })
      .from(ecoListings)
      .leftJoin(ecoCategories, eq(ecoListings.category_id, ecoCategories.id))
      .where(inArray(ecoListings.status, ["DRAFT", "ARCHIVED"] as any[]))
      .orderBy(desc(ecoListings.updated_at ?? ecoListings.created_at))
      .limit(limit)

    return { data: rows.map(formatAdminListing), error: null }
  } catch (error) {
    console.error("[services/admin/listings] Failed to fetch pending listings:", error)
    return { data: null, error: toError(error) }
  }
}

export async function approveListingRecord(listingId: string) {
  try {
    await db
      .get()
      .update(ecoListings)
      .set({ status: "ACTIVE", visibility: "PUBLIC", updated_at: new Date() })
      .where(eq(ecoListings.id, listingId))
    return { error: null }
  } catch (error) {
    return { error: toError(error) }
  }
}

export async function rejectListingRecord(listingId: string) {
  try {
    await db
      .get()
      .update(ecoListings)
      .set({ status: "REJECTED" as any, visibility: "PRIVATE", updated_at: new Date() })
      .where(eq(ecoListings.id, listingId))
    return { error: null }
  } catch (error) {
    return { error: toError(error) }
  }
}

export async function updateListingRecord(listingId: string, data: AdminListingUpdateInput) {
  warnIfV2FlagDisabled()

  try {
    const categoryId = await resolveCategoryId(data.category)
    if (!categoryId) {
      return { error: new Error("Kategoria është e pavlefshme ose mungon.") }
    }

    const quantityValue = Number.parseFloat(data.quantity)
    const quantity = Number.isFinite(quantityValue) ? quantityValue.toString() : null

    const updateResult = await db
      .get()
      .update(ecoListings)
      .set({
        title: data.title,
        description: data.description,
        category_id: categoryId,
        flow_type: mapFlowType(data.listing_type) as typeof ecoListings.$inferInsert.flow_type,
        price: data.price.toFixed(2),
        unit: data.unit,
        quantity,
        city: data.location,
        location_details: data.location,
        status: data.is_approved ? "ACTIVE" : "DRAFT",
        visibility: "PUBLIC",
        updated_at: new Date(),
      })
      .where(eq(ecoListings.id, listingId))
      .returning({ id: ecoListings.id })

    if (!updateResult[0]?.id) {
      return { error: new Error("Listimi nuk u gjet.") }
    }

    return { error: null }
  } catch (error) {
    console.error("[services/admin/listings] Failed to update listing:", error)
    return { error: toError(error) }
  }
}
