"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  fetchCurrentUserProfile,
  updateOrganizationRecord,
  updateUserProfileRecord,
  type ProfileOrganization,
  type ProfileUser,
} from "@/src/services/profile"

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

export type UserProfileUpdate = {
  emri_i_plote: string
  vendndodhja: string
}

interface OrgFormData {
  emri: string
  pershkrimi: string
  interesi_primar: string
  person_kontakti: string
  email_kontakti: string
  vendndodhja: string
}

export async function updateUserProfile(formData: UserProfileUpdate) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/kycu?message=Ju duhet të kyçeni për të përditësuar profilin.")
  }

  try {
    const { error } = await updateUserProfileRecord(supabase, user.id, formData)

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

export async function updateOrganizationProfile(organizationId: string, formData: OrgFormData) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/kycu?message=Ju duhet të kyçeni për të përditësuar profilin e organizatës.")
  }

  try {
    // Basic check: ensure the user is part of this organization
    const { data: orgMember, error: orgMemberError } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single()

    if (orgMemberError || !orgMember) {
      console.error("User not authorized to update this organization:", orgMemberError);
      return { error: "Nuk jeni i autorizuar të përditësoni këtë organizatë." };
    }

    const { error } = await updateOrganizationRecord(supabase, organizationId, formData)

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
