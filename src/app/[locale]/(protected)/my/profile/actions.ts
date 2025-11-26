"use server"

import { revalidatePath } from "next/cache"
import { updateUserProfileRecord } from "@/services/profile"
import { userProfileUpdateSchema } from "@/validation/profile"

export async function updateUserProfile(
  userId: string,
  data: { full_name: string; location: string }
) {
  try {
    const validated = userProfileUpdateSchema.parse(data)
    const result = await updateUserProfileRecord(userId, validated)

    if (result.error) {
      return { error: "Gabim gjatë përditësimit të profilit." }
    }

    revalidatePath("/[locale]/(protected)/my", "layout")
    revalidatePath("/[locale]/(protected)/profile", "page")

    return { success: true }
  } catch (error) {
    console.error("[updateUserProfile] Error:", error)
    return { error: "Gabim gjatë përditësimit të profilit." }
  }
}
