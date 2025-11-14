import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { marketplaceListings } from "@/db/schema"
import type { AdminListingUpdateInput } from "@/validation/admin"
export type { AdminListingUpdateInput } from "@/validation/admin"

export type AdminListingRow = typeof marketplaceListings.$inferSelect

export interface AdminListing {
  id: string
  created_by_user_id: string
  organization_id: string | null
  titulli: string
  pershkrimi: string
  kategori: string
  cmimi: number
  njesia: string
  vendndodhja: string
  sasia: string
  lloji_listimit: string
  eshte_aprovuar: boolean
  created_at: string
  updated_at: string | null
}

export async function fetchAdminListings() {
  try {
    const rows = await db.get().select().from(marketplaceListings)
    const serialized: AdminListing[] = rows.map((listing) => ({
      ...listing,
      cmimi: Number(listing.cmimi),
      created_at: listing.created_at.toISOString(),
      updated_at: listing.updated_at ? listing.updated_at.toISOString() : null,
    }))

    return { data: serialized, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function deleteListingRecord(listingId: string) {
  try {
    await db.get().delete(marketplaceListings).where(eq(marketplaceListings.id, listingId))
    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}

export async function updateListingRecord(listingId: string, data: AdminListingUpdateInput) {
  try {
    await db
      .get()
      .update(marketplaceListings)
      .set({
        ...data,
        cmimi: data.cmimi.toString(),
        updated_at: new Date(),
      })
      .where(eq(marketplaceListings.id, listingId))

    return { error: null }
  } catch (error) {
    return { error: error as Error }
  }
}
