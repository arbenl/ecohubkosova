import { unstable_noStore as noStore } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { OrganizationProfileUpdateInput, UserProfileUpdateInput } from "@/validation/profile"

export type ProfileUser = {
  id: string
  emri_i_plote: string
  email: string
  vendndodhja: string
  roli: string
  eshte_aprovuar: boolean
  created_at: string
}

export type ProfileOrganization = {
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

export async function fetchCurrentUserProfile() {
  noStore()
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser()

  if (sessionError || !user) {
    return { userProfile: null, organization: null, error: "Përdoruesi nuk është i kyçur." }
  }

  try {
    const { data: userProfile, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (userError || !userProfile) {
      throw userError ?? new Error("Profili i përdoruesit nuk u gjet.")
    }

    let organization: ProfileOrganization | null = null

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

        if (orgError) {
          throw orgError
        }
        organization = orgData
      }
    }

    return { userProfile, organization, error: null }
  } catch (error) {
    console.error("fetchCurrentUserProfile error:", error)
    return {
      userProfile: null,
      organization: null,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të profilit.",
    }
  }
}

type AnySupabaseClient = SupabaseClient<any, any, any>

export async function updateUserProfileRecord(
  supabase: AnySupabaseClient,
  userId: string,
  data: UserProfileUpdateInput
) {
  return supabase
    .from("users")
    .update({
      emri_i_plote: data.emri_i_plote,
      vendndodhja: data.vendndodhja,
    })
    .eq("id", userId)
}

export async function updateOrganizationRecord(
  supabase: AnySupabaseClient,
  organizationId: string,
  data: OrganizationProfileUpdateInput
) {
  return supabase
    .from("organizations")
    .update({
      emri: data.emri,
      pershkrimi: data.pershkrimi,
      interesi_primar: data.interesi_primar,
      person_kontakti: data.person_kontakti,
      email_kontakti: data.email_kontakti,
      vendndodhja: data.vendndodhja,
    })
    .eq("id", organizationId)
}

export async function ensureUserOrganizationMembership(
  supabase: AnySupabaseClient,
  organizationId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .single()

  if (error) {
    const code = (error as { code?: string } | null)?.code
    if (code === "PGRST116") {
      return { isMember: false, error: null }
    }
    return { isMember: false, error }
  }

  return { isMember: Boolean(data), error: null }
}
