"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface OrganizationUpdateData {
  emri: string
  pershkrimi: string
  interesi_primar: string
  person_kontakti: string
  email_kontakti: string
  vendndodhja: string
  lloji: string
  eshte_aprovuar: boolean
  updated_at: string
}

export async function deleteOrganization(organizationId: string) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të fshini organizata.")
  }

  try {
    const { error } = await supabase.from("organizations").delete().eq("id", organizationId)

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të përditësoni organizata.")
  }

  try {
    const { error } = await supabase
      .from("organizations")
      .update({
        emri: formData.emri,
        pershkrimi: formData.pershkrimi,
        interesi_primar: formData.interesi_primar,
        person_kontakti: formData.person_kontakti,
        email_kontakti: formData.email_kontakti,
        vendndodhja: formData.vendndodhja,
        lloji: formData.lloji,
        eshte_aprovuar: formData.eshte_aprovuar,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId)

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
