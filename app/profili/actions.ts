"use server"

import { createRouteHandlerSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Define interfaces for the data shapes
interface UserProfile {
  id: string
  emri_i_plotë: string
  email: string
  vendndodhja: string
  roli: string
  eshte_aprovuar: boolean
  created_at: string
}

interface Organization {
  id: string
  emri: string
  pershkrimi: string
  interesi_primar: string
  person_kontakti: string
  email_kontakti: string
  vendndodhja: string
  lloji: string
  eshte_aprovuar: boolean
}

// Define the return type for our new server action
type ProfileDataResult = {
  userProfile: UserProfile | null
  organization: Organization | null
  error: string | null
}

export async function getProfileData(): Promise<ProfileDataResult> {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return { userProfile: null, organization: null, error: "Përdoruesi nuk është i kyçur." }
    }

    // 1. Fetch the user's public profile
    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (userError) throw userError
    if (!userProfile) throw new Error("Profili i përdoruesit nuk mund të gjendej.")

    let organization: Organization | null = null

    // 2. If the user is part of an organization, fetch that too
    if (userProfile.roli !== "Individ" && userProfile.roli !== "Admin") {
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("eshte_aprovuar", true)
        .single()

      if (orgMember) {
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", orgMember.organization_id)
          .single()

        if (orgError) throw orgError
        organization = orgData
      }
    }

    return { userProfile, organization, error: null }
  } catch (err: any) {
    console.error("Server Action Error (getProfileData):", err)
    return {
      userProfile: null,
      organization: null,
      error: err.message || "Gabim gjatë ngarkimit të të dhënave të profilit.",
    }
  }
}

interface UserFormData {
  emri_i_plotë: string
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

export async function updateUserProfile(formData: UserFormData) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/kycu?message=Ju duhet të kyçeni për të përditësuar profilin.")
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({
        emri_i_plotë: formData.emri_i_plotë,
        vendndodhja: formData.vendndodhja,
      })
      .eq("id", user.id)

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

    const { error } = await supabase
      .from("organizations")
      .update({
        emri: formData.emri,
        pershkrimi: formData.pershkrimi,
        interesi_primar: formData.interesi_primar,
        person_kontakti: formData.person_kontakti,
        email_kontakti: formData.email_kontakti,
        vendndodhja: formData.vendndodhja,
      })
      .eq("id", organizationId)

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
