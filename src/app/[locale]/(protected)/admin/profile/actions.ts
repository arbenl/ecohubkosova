"use server"

import { revalidatePath } from "next/cache"
import { updateUserProfileRecord } from "@/services/profile"
import { userProfileUpdateSchema } from "@/validation/profile"
import { getServerUser } from "@/lib/supabase/server"

export async function updateAdminProfile(
  userId: string,
  data: { full_name: string; location: string }
) {
  try {
    const { user } = await getServerUser()

    if (!user?.id || user.id !== userId) {
      return { error: "Nuk keni leje për të përditësuar këtë profil." }
    }

    const validated = userProfileUpdateSchema.parse(data)
    const result = await updateUserProfileRecord(userId, validated)

    if (result.error) {
      return { error: "Gabim gjatë përditësimit të profilit." }
    }

    revalidatePath("/[locale]/(protected)/admin", "layout")
    revalidatePath("/[locale]/(protected)/profile", "page")

    return { success: true }
  } catch (error) {
    console.error("[updateAdminProfile] Error:", error)
    return { error: "Gabim gjatë përditësimit të profilit." }
  }
}
