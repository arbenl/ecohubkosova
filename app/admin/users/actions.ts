"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface UserUpdateData {
  emri_i_plotë: string
  email: string
  vendndodhja: string
  roli: string
  eshte_aprovuar: boolean
  updated_at: string
}

export async function deleteUser(userId: string) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të fshini përdorues.")
  }

  try {
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Error deleting user:", error)
      return { error: error.message || "Gabim gjatë fshirjes së përdoruesit." }
    }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (deleteUser):", error)
    return { error: error.message || "Gabim i panjohur gjatë fshirjes së përdoruesit." }
  }
}

export async function updateUser(userId: string, formData: UserUpdateData) {
  const supabase = createRouteHandlerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.user_metadata.role !== "Admin") {
    redirect("/auth/kycu?message=Nuk jeni i autorizuar të përditësoni përdorues.")
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({
        emri_i_plotë: formData.emri_i_plotë,
        email: formData.email,
        vendndodhja: formData.vendndodhja,
        roli: formData.roli,
        eshte_aprovuar: formData.eshte_aprovuar,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating user:", error)
      return { error: error.message || "Gabim gjatë përditësimit të përdoruesit." }
    }

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error: any) {
    console.error("Server Action Error (updateUser):", error)
    return { error: error.message || "Gabim i panjohur gjatë përditësimit të përdoruesit." }
  }
}
