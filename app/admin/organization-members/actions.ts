"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface OrganizationMemberUpdateData {
  roli_ne_organizate: string
  eshte_aprovuar: boolean
}

export async function deleteOrganizationMember(memberId: string) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të fshini anëtarë organizate.")
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të përditësoni anëtarë organizate.")
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të ndryshoni statusin e aprovimit.")
  }

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
