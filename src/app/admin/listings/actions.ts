"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdminRole } from "@/lib/auth/roles"
import {
  deleteListingRecord,
  fetchAdminListings,
  updateListingRecord,
  type AdminListing,
  type AdminListingUpdateInput,
} from "@/services/admin/listings"

type ListingUpdateData = AdminListingUpdateInput

type GetListingsResult = {
  data: AdminListing[] | null
  error: string | null
}

export async function getListings(): Promise<GetListingsResult> {
  try {
    const { data, error } = await fetchAdminListings()

    if (error) {
      console.error("Error fetching listings:", error)
      return { data: null, error: error.message || "Gabim gjatë marrjes së listimeve." }
    }

    return { data: data ?? [], error: null }
  } catch (error) {
    console.error("Server Action Error (getListings):", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gabim i panjohur gjatë marrjes së listimeve.",
    }
  }
}

export async function deleteListing(listingId: string) {
  const supabase = createRouteHandlerSupabaseClient()
  await requireAdminRole(supabase)

  try {
    const { error } = await deleteListingRecord(supabase, listingId)

    if (error) {
      console.error("Error deleting listing:", error)
      return { error: error.message || "Gabim gjatë fshirjes së listimit." }
    }

    revalidatePath("/admin/listings")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (deleteListing):", error)
    return { error: error.message || "Gabim i panjohur gjatë fshirjes së listimit." }
  }
}

export async function updateListing(listingId: string, formData: ListingUpdateData) {
  const supabase = createRouteHandlerSupabaseClient()
  await requireAdminRole(supabase)

  try {
    const { error } = await updateListingRecord(supabase, listingId, formData)

    if (error) {
      console.error("Error updating listing:", error)
      return { error: error.message || "Gabim gjatë përditësimit të listimit." }
    }

    revalidatePath("/admin/listings")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateListing):", error)
    return { error: error.message || "Gabim i panjohur gjatë përditësimit të listimit." }
  }
}
