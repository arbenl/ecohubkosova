"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdminRole } from "@/lib/auth/roles"
import {
  deleteOrganizationMemberRecord,
  fetchAdminOrganizationMembers,
  toggleOrganizationMemberApprovalRecord,
  updateOrganizationMemberRecord,
  type AdminOrganizationMemberUpdateInput,
  type AdminOrganizationMemberWithDetails,
} from "@/services/admin/organization-members"
import { adminOrganizationMemberUpdateSchema } from "@/validation/admin"

type OrganizationMemberUpdateData = AdminOrganizationMemberUpdateInput

type GetOrganizationMembersResult = {
  data: AdminOrganizationMemberWithDetails[] | null
  error: string | null
}

export async function getOrganizationMembers(): Promise<GetOrganizationMembersResult> {
  try {
    const { data, error } = await fetchAdminOrganizationMembers()

    if (error) {
      console.error("Error fetching organization members:", error)
      return { data: null, error: error.message || "Gabim gjatë marrjes së anëtarëve të organizatave." }
    }

    return { data: data ?? [], error: null }
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
    const { error } = await deleteOrganizationMemberRecord(memberId)

    if (error) {
      console.error("Error deleting organization member:", error)
      return { error: error.message ?? "Gabim gjatë fshirjes së anëtarit të organizatës." }
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

  const parsed = adminOrganizationMemberUpdateSchema.safeParse(formData)
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message || "Të dhënat e anëtarit të organizatës nuk janë të vlefshme."
    return { error: message }
  }

  try {
    const { error } = await updateOrganizationMemberRecord(memberId, parsed.data)

    if (error) {
      console.error("Error updating organization member:", error)
      return { error: error.message ?? "Gabim gjatë përditësimit të anëtarit të organizatës." }
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
    const { error } = await toggleOrganizationMemberApprovalRecord(memberId, currentStatus)

    if (error) {
      console.error("Error toggling approval status:", error)
      return { error: error.message ?? "Gabim gjatë ndryshimit të statusit të aprovimit." }
    }

    revalidatePath("/admin/organization-members")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (toggleOrganizationMemberApproval):", error)
    return { error: error.message || "Gabim i panjohur gjatë ndryshimit të statusit të aprovimit." }
  }
}
