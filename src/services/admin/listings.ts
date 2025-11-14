import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { marketplaceListings } from "@/db/schema"
import { createServerSupabaseClient } from "@/lib/supabase/server"
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

const LISTINGS_TABLE = "tregu_listime"

const formatTimestamp = (value: Date | string | null | undefined) => {
  if (!value) {
    return null
  }
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

const toError = (error: unknown) => {
  if (!error) {
    return null
  }
  return error instanceof Error ? error : new Error(typeof error === "object" && error && "message" in error ? String((error as any).message) : "Supabase error")
}

async function fetchAdminListingsViaSupabase() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from(LISTINGS_TABLE).select("*")

  if (error) {
    return { data: null, error: toError(error) }
  }

  const serialized: AdminListing[] =
    (data ?? []).map((listing: Record<string, any>) => ({
      ...listing,
      cmimi: Number(listing.cmimi),
      created_at: formatTimestamp(listing.created_at) ?? "",
      updated_at: formatTimestamp(listing.updated_at),
    })) ?? []

  return { data: serialized, error: null }
}

async function deleteListingViaSupabase(listingId: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from(LISTINGS_TABLE).delete().eq("id", listingId)
  return { error: toError(error) }
}

async function updateListingViaSupabase(listingId: string, data: AdminListingUpdateInput) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from(LISTINGS_TABLE)
    .update({
      ...data,
      cmimi: data.cmimi.toString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId)

  return { error: toError(error) }
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
    console.warn("[services/admin/listings] Drizzle fetch failed; falling back to Supabase REST.", error)
    return fetchAdminListingsViaSupabase()
  }
}

export async function deleteListingRecord(listingId: string) {
  try {
    await db.get().delete(marketplaceListings).where(eq(marketplaceListings.id, listingId))
    return { error: null }
  } catch (error) {
    console.warn("[services/admin/listings] Drizzle delete failed; falling back to Supabase REST.", error)
    return deleteListingViaSupabase(listingId)
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
    console.warn("[services/admin/listings] Drizzle update failed; falling back to Supabase REST.", error)
    return updateListingViaSupabase(listingId, data)
  }
}
