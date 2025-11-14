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

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(typeof error === "string" ? error : "Gabim i panjohur.")

const serializeListing = (listing: AdminListingRow): AdminListing => ({
  ...listing,
  cmimi: Number(listing.cmimi),
  created_at: listing.created_at.toISOString(),
  updated_at: listing.updated_at ? listing.updated_at.toISOString() : null,
})

export async function fetchAdminListings() {
  try {
    const rows = await db.get().select().from(marketplaceListings)
    return { data: rows.map(serializeListing), error: null }
  } catch (error) {
    console.error("[services/admin/listings] Failed to fetch listings:", error)
    return { data: null, error: toError(error) }
  }
}

export async function deleteListingRecord(listingId: string) {
  try {
    await db.get().delete(marketplaceListings).where(eq(marketplaceListings.id, listingId))
    return { error: null }
  } catch (error) {
    console.error("[services/admin/listings] Failed to delete listing:", error)
    return { error: toError(error) }
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
    console.error("[services/admin/listings] Failed to update listing:", error)
    return { error: toError(error) }
  }
}
