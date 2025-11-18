import { and, eq, ilike } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { marketplaceListings, organizations } from "@/db/schema"

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
    const conditions = [eq(marketplaceListings.is_approved, true)]

    if (filters.category) {
      conditions.push(eq(marketplaceListings.category, filters.category))
    }

    if (filters.type) {
      conditions.push(eq(marketplaceListings.listing_type, filters.type))
    }

    if (filters.search) {
      const term = `%${filters.search}%`
      conditions.push(ilike(marketplaceListings.title, term))
    }

    const rows = await db
      .get()
      .select({
        listing: marketplaceListings,
        organization_name: organizations.name,
      })
      .from(marketplaceListings)
      .leftJoin(organizations, eq(marketplaceListings.organization_id, organizations.id))
      .where(and(...conditions))
      .orderBy(marketplaceListings.created_at)

    const data: PublicListing[] = rows.map(({ listing, organization_name }) => ({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      price: Number(listing.price),
      unit: listing.unit,
      location: listing.location,
      quantity: listing.quantity,
      listing_type: listing.listing_type as "shes" | "blej",
      organization_name: organization_name ?? null,
      created_at: listing.created_at.toISOString(),
      updated_at: listing.updated_at ? listing.updated_at.toISOString() : null,
    }))

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
