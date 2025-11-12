"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface ListingUpdateData {
  titulli: string
  pershkrimi: string
  kategori: string
  çmimi: number
  njesia: string
  vendndodhja: string
  sasia: string
  lloji_listimit: string
  eshte_aprovuar: boolean
  updated_at: string
}

export async function deleteListing(listingId: string) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të fshini listime.")
  }

  try {
    const { error } = await supabase.from("tregu_listime").delete().eq("id", listingId)

    if (error) {
      console.error("Error deleting listing:", error)
      return { error: error.message || "Gabim gjatë fshirjes së listimit." }
    }

    revalidatePath("/admin/listings")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (deleteListing):", error)
    return { error: error.message || "Gabim i panjohur gjatë fshirjes së listimit." }
  }
}

export async function updateListing(listingId: string, formData: ListingUpdateData) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të përditësoni listime.")
  }

  try {
    const { error } = await supabase
      .from("tregu_listime")
      .update({
        titulli: formData.titulli,
        pershkrimi: formData.pershkrimi,
        kategori: formData.kategori,
        çmimi: formData.çmimi,
        njesia: formData.njesia,
        vendndodhja: formData.vendndodhja,
        sasia: formData.sasia,
        lloji_listimit: formData.lloji_listimit,
        eshte_aprovuar: formData.eshte_aprovuar,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listingId)

    if (error) {
      console.error("Error updating listing:", error)
      return { error: error.message || "Gabim gjatë përditësimit të listimit." }
    }

    revalidatePath("/admin/listings")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateListing):", error)
    return { error: error.message || "Gabim i panjohur gjatë përditësimit të listimit." }
  }
}
