"use server"

import { revalidatePath } from "next/cache"
import { updateOrganizationRecord, ensureUserOrganizationMembership } from "@/services/profile"
import { organizationProfileUpdateSchema } from "@/validation/profile"
import { getServerUser } from "@/lib/supabase/server"

export async function updateOrganizationProfile(
  organizationId: string,
  data: {
    name: string
    description: string
    primary_interest: string
    contact_person: string
    contact_email: string
    location: string
  }
) {
  try {
    const { user } = await getServerUser()

    if (!user?.id) {
      return { error: "Ju duhet të jeni të kyçur." }
    }

    // Check if user is a member of this organization
    const { isMember, error: membershipError } = await ensureUserOrganizationMembership(
      organizationId,
      user.id
    )

    if (membershipError || !isMember) {
      return { error: "Nuk keni leje për të përditësuar këtë organizatë." }
    }

    const validated = organizationProfileUpdateSchema.parse(data)
    const result = await updateOrganizationRecord(organizationId, validated)

    if (result.error) {
      return { error: "Gabim gjatë përditësimit të profilit të organizatës." }
    }

    revalidatePath("/[locale]/(protected)/my/organization", "layout")
    revalidatePath("/[locale]/(protected)/profile", "page")

    return { success: true }
  } catch (error) {
    console.error("[updateOrganizationProfile] Error:", error)
    return { error: "Gabim gjatë përditësimit të profilit të organizatës." }
  }
}
