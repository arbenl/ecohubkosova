"use server"

import { revalidatePath } from "next/cache"
import { getServerUser } from "@/lib/supabase/server"
import { deleteUserListing } from "@/services/listings"

export async function archiveListingAction(listingId: string, locale: string) {
  const { user } = await getServerUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const result = await deleteUserListing(listingId, user.id)

  if ("error" in result) {
    throw new Error(result.error)
  }

  // Revalidate paths (Next.js handles locale automatically with localePrefix: "always")
  revalidatePath("/my/listings")
  revalidatePath("/marketplace")
  revalidatePath(`/marketplace/${listingId}`)

  return { success: true }
}
