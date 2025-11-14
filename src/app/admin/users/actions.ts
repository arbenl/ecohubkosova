"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdminRole } from "@/lib/auth/roles"
import {
  deleteUserRecord,
  fetchAdminUsers,
  updateUserRecord,
  type AdminUser,
  type AdminUserUpdateInput,
} from "@/services/admin/users"

type UserUpdateData = AdminUserUpdateInput

type GetUsersResult = {
  data: AdminUser[] | null
  error: string | null
}

export async function getUsers(): Promise<GetUsersResult> {
  try {
    const { data, error } = await fetchAdminUsers()

    if (error) {
      console.error("Error fetching users:", error)
      return { data: null, error: error.message || "Gabim gjatë marrjes së përdoruesve." }
    }

    return { data: data ?? [], error: null }
  } catch (error) {
    console.error("Server Action Error (getUsers):", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gabim i panjohur gjatë marrjes së përdoruesve.",
    }
  }
}

export async function deleteUser(userId: string) {
  const supabase = createRouteHandlerSupabaseClient()
  await requireAdminRole(supabase)

  try {
    const { error } = await deleteUserRecord(supabase, userId)

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
  await requireAdminRole(supabase)

  try {
    const { error } = await updateUserRecord(supabase, userId, formData)

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
