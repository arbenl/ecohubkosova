"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  ensureUserOrganizationMembership,
  fetchCurrentUserProfile,
  updateOrganizationRecord,
  updateUserProfileRecord,
  type ProfileOrganization,
  type ProfileUser,
} from "@/services/profile"
import {
  organizationProfileUpdateSchema,
  userProfileUpdateSchema,
  type OrganizationProfileUpdateInput,
  type UserProfileUpdateInput,
} from "@/validation/profile"

export type UserProfile = ProfileUser
type Organization = ProfileOrganization

type ProfileDataResult = {
  userProfile: ProfileUser | null
  organization: ProfileOrganization | null
  error: string | null
}

export async function getProfileData(): Promise<ProfileDataResult> {
  return fetchCurrentUserProfile()
}

export type UserProfileUpdate = UserProfileUpdateInput

export async function updateUserProfile(formData: UserProfileUpdateInput) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/kycu?message=Ju duhet të kyçeni për të përditësuar profilin.")
  }

  const parsed = userProfileUpdateSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Të dhëna të pavlefshme për profilin personal." }
  }

  const payload = parsed.data

  try {
    const { error } = await updateUserProfileRecord(user.id, payload)

    if (error) {
      console.error("Error updating user profile:", error)
      return { error: error.message || "Gabim gjatë përditësimit të profilit personal." }
    }

    revalidatePath("/profili")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateUserProfile):", error)
    return { error: error.message || "Gabim i panjohur gjatë përditësimit të profilit personal." }
  }
}

export async function updateOrganizationProfile(
  organizationId: string,
  formData: OrganizationProfileUpdateInput
) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/kycu?message=Ju duhet të kyçeni për të përditësuar profilin e organizatës.")
  }

  const parsed = organizationProfileUpdateSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Të dhëna të pavlefshme për organizatën." }
  }

  const payload = parsed.data

  try {
    const membership = await ensureUserOrganizationMembership(organizationId, user.id)

    if (membership.error) {
      console.error("Error verifying organization membership:", membership.error)
      return { error: "Gabim gjatë verifikimit të autorizimit të organizatës." }
    }

    if (!membership.isMember) {
      return { error: "Nuk jeni i autorizuar të përditësoni këtë organizatë." }
    }

    const { error } = await updateOrganizationRecord(organizationId, payload)

    if (error) {
      console.error("Error updating organization profile:", error)
      return { error: error.message || "Gabim gjatë përditësimit të profilit të organizatës." }
    }

    revalidatePath("/profili")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateOrganizationProfile):", error)
    return { error: error.message || "Gabim i panjohur gjatë përditësimit të profilit të organizatës." }
  }
}
