"use server"

import { createRouteHandlerSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdminRole } from "@/lib/auth/roles"

interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  roli_ne_organizate: string
  eshte_aprovuar: boolean
  created_at: string
}

interface OrganizationMemberWithDetails extends OrganizationMember {
  organization_name?: string
  user_name?: string
  user_email?: string
}

interface OrganizationMemberUpdateData {
  roli_ne_organizate: string
  eshte_aprovuar: boolean
}

type GetOrganizationMembersResult = {
  data: OrganizationMemberWithDetails[] | null
  error: string | null
}

export async function getOrganizationMembers(): Promise<GetOrganizationMembersResult> {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("organization_members").select(`
          *,
          organizations!inner(emri),
          users!inner(emri_i_plote, email)
        `)

    if (error) {
      console.error("Error fetching organization members:", error)
      return { data: null, error: error.message || "Gabim gjatë marrjes së anëtarëve të organizatave." }
    }

    const formattedData =
      data?.map((member: any) => ({
        ...member,
        organization_name: member.organizations?.emri,
        user_name: member.users?.emri_i_plote,
        user_email: member.users?.email,
      })) || []

    return { data: formattedData, error: null }
  } catch (error) {
    console.error("Server Action Error (getOrganizationMembers):", error)
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Gabim i panjohur gjatë marrjes së anëtarëve të organizatave.",
    }
  }
}

export async function deleteOrganizationMember(memberId: string) {
  const supabase = createRouteHandlerSupabaseClient()
  await requireAdminRole(supabase)

  try {
    const { error } = await supabase.from("organization_members").delete().eq("id", memberId)

    if (error) {
      console.error("Error deleting organization member:", error)
      return { error: error.message || "Gabim gjatë fshirjes së anëtarit të organizatës." }
    }

    revalidatePath("/admin/organization-members")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (deleteOrganizationMember):", error)
    return { error: error.message || "Gabim i panjohur gjatë fshirjes së anëtarit të organizatës." }
  }
}

export async function updateOrganizationMember(memberId: string, formData: OrganizationMemberUpdateData) {
  const supabase = createRouteHandlerSupabaseClient()
  await requireAdminRole(supabase)

  try {
    const { error } = await supabase
      .from("organization_members")
      .update({
        roli_ne_organizate: formData.roli_ne_organizate,
        eshte_aprovuar: formData.eshte_aprovuar,
      })
      .eq("id", memberId)

    if (error) {
      console.error("Error updating organization member:", error)
      return { error: error.message || "Gabim gjatë përditësimit të anëtarit të organizatës." }
    }

    revalidatePath("/admin/organization-members")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateOrganizationMember):", error)
    return { error: error.message || "Gabim i panjohur gjatë përditësimit të anëtarit të organizatës." }
  }
}

export async function toggleOrganizationMemberApproval(memberId: string, currentStatus: boolean) {
  const supabase = createRouteHandlerSupabaseClient()
  await requireAdminRole(supabase)

  try {
    const { error } = await supabase
      .from("organization_members")
      .update({ eshte_aprovuar: !currentStatus })
      .eq("id", memberId)

    if (error) {
      console.error("Error toggling approval status:", error)
      return { error: error.message || "Gabim gjatë ndryshimit të statusit të aprovimit." }
    }

    revalidatePath("/admin/organization-members")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (toggleOrganizationMemberApproval):", error)
    return { error: error.message || "Gabim i panjohur gjatë ndryshimit të statusit të aprovimit." }
  }
}
