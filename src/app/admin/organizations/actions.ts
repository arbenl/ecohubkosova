"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdminRole } from "@/lib/auth/roles"
import {
  deleteOrganizationRecord,
  fetchAdminOrganizations,
  updateOrganizationRecord,
  type AdminOrganization,
  type AdminOrganizationUpdateInput,
} from "@/services/admin/organizations"

type OrganizationUpdateData = AdminOrganizationUpdateInput

type GetOrganizationsResult = {
  data: AdminOrganization[] | null
  error: string | null
}

export async function getOrganizations(): Promise<GetOrganizationsResult> {
  try {
    const { data, error } = await fetchAdminOrganizations()

    if (error) {
      console.error("Error fetching organizations:", error)
      return { data: null, error: error.message || "Gabim gjatë marrjes së organizatave." }
    }

    return { data: data ?? [], error: null }
  } catch (error) {
    console.error("Server Action Error (getOrganizations):", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gabim i panjohur gjatë marrjes së organizatave.",
    }
  }
}

export async function deleteOrganization(organizationId: string) {
  const supabase = createRouteHandlerSupabaseClient()
  await requireAdminRole(supabase)

  try {
    const { error } = await deleteOrganizationRecord(supabase, organizationId)

    if (error) {
      console.error("Error deleting organization:", error)
      return { error: error.message || "Gabim gjatë fshirjes së organizatës." }
    }

    revalidatePath("/admin/organizations")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (deleteOrganization):", error)
    return { error: error.message || "Gabim i panjohur gjatë fshirjes së organizatës." }
  }
}

export async function updateOrganization(organizationId: string, formData: OrganizationUpdateData) {
  const supabase = createRouteHandlerSupabaseClient()
  await requireAdminRole(supabase)

  try {
    const { error } = await updateOrganizationRecord(supabase, organizationId, formData)

    if (error) {
      console.error("Error updating organization:", error)
      return { error: error.message || "Gabim gjatë përditësimit të organizatës." }
    }

    revalidatePath("/admin/organizations")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateOrganization):", error)
    return { error: error.message || "Gabim i panjohur gjatë përditësimit të organizatës." }
  }
}
