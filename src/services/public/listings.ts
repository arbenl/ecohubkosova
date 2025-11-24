import { and, eq, ilike, or, sql, type SQL } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { ecoCategories, ecoListings, organizations } from "@/db/schema"

export type PublicListing = {
  id: string
  title: string
  description: string
  category: string
  price: number
  unit: string
  location: string
  quantity: string
  listing_type: "shes" | "blej"
  organization_name: string | null
  created_at: string
  updated_at: string | null
}

export type PublicListingFilters = {
  category?: string
  type?: "shes" | "blej"
  search?: string
}

export async function fetchPublicListings(filters: PublicListingFilters = {}) {
  try {
    const conditions: SQL<unknown>[] = [
      eq(ecoListings.status, "ACTIVE" as any),
      eq(ecoListings.visibility, "PUBLIC" as any),
    ]

    if (filters.category) {
      const categoryCondition = or(
        eq(ecoCategories.slug, filters.category),
        ilike(ecoCategories.name_en, `%${filters.category}%`),
        ilike(ecoCategories.name_sq, `%${filters.category}%`)
      )
      if (categoryCondition) {
        conditions.push(categoryCondition)
      }
    }

    if (filters.type) {
      const flowTypeClause: SQL<unknown> =
        filters.type === "shes"
          ? sql`${ecoListings.flow_type}::text ILIKE 'OFFER%'`
          : sql`${ecoListings.flow_type}::text ILIKE 'REQUEST%'`
      conditions.push(flowTypeClause)
    }

    if (filters.search) {
      const term = `%${filters.search}%`
      conditions.push(ilike(ecoListings.title, term))
    }

    const rows = await db
      .get()
      .select({
        listing: ecoListings,
        organization_name: organizations.name,
        category_name_en: ecoCategories.name_en,
        category_name_sq: ecoCategories.name_sq,
      })
      .from(ecoListings)
      .leftJoin(ecoCategories, eq(ecoListings.category_id, ecoCategories.id))
      .leftJoin(organizations, eq(ecoListings.organization_id, organizations.id))
      .where(and(...conditions))
      .orderBy(ecoListings.created_at)

    const data: PublicListing[] = rows.map(({ listing, organization_name }) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      category: listing.category_id || "",
      price: listing.price ? Number(listing.price) : 0,
      unit: listing.unit || "",
      location: [listing.city, listing.region].filter(Boolean).join(", "),
      quantity: listing.quantity ? listing.quantity.toString() : "",
      listing_type: listing.flow_type?.startsWith("OFFER") ? "shes" : "blej",
      organization_name: organization_name ?? null,
      created_at: listing.created_at.toISOString(),
      updated_at: listing.updated_at ? listing.updated_at.toISOString() : null,
    }))

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
