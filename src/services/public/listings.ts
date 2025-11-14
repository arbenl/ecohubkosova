import { and, eq, ilike } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { marketplaceListings, organizations } from "@/db/schema"

export type PublicListing = {
  id: string
  titulli: string
  pershkrimi: string
  kategori: string
  cmimi: number
  njesia: string
  vendndodhja: string
  sasia: string
  lloji_listimit: "shes" | "blej"
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
    const conditions = [eq(marketplaceListings.eshte_aprovuar, true)]

    if (filters.category) {
      conditions.push(eq(marketplaceListings.kategori, filters.category))
    }

    if (filters.type) {
      conditions.push(eq(marketplaceListings.lloji_listimit, filters.type))
    }

    if (filters.search) {
      const term = `%${filters.search}%`
      conditions.push(ilike(marketplaceListings.titulli, term))
    }

    const rows = await db
      .get()
      .select({
        listing: marketplaceListings,
        organization_name: organizations.emri,
      })
      .from(marketplaceListings)
      .leftJoin(organizations, eq(marketplaceListings.organization_id, organizations.id))
      .where(and(...conditions))
      .orderBy(marketplaceListings.created_at)

    const data: PublicListing[] = rows.map(({ listing, organization_name }) => ({
      id: listing.id,
      titulli: listing.titulli,
      pershkrimi: listing.pershkrimi,
      kategori: listing.kategori,
      cmimi: Number(listing.cmimi),
      njesia: listing.njesia,
      vendndodhja: listing.vendndodhja,
      sasia: listing.sasia,
      lloji_listimit: listing.lloji_listimit as "shes" | "blej",
      organization_name: organization_name ?? null,
      created_at: listing.created_at.toISOString(),
      updated_at: listing.updated_at ? listing.updated_at.toISOString() : null,
    }))

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
