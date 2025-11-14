import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { AdminUserUpdateInput } from "@/validation/admin"
export type { AdminUserUpdateInput } from "@/validation/admin"

export interface AdminUser {
  id: string
  emri_i_plote: string
  email: string
  vendndodhja: string
  roli: string
  eshte_aprovuar: boolean
  created_at: string
  updated_at: string | null
}

type AnySupabaseClient = SupabaseClient<any, any, any>

export async function fetchAdminUsers() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("users").select("*")
  return { data: data ?? [], error }
}

export function deleteUserRecord(supabase: AnySupabaseClient, userId: string) {
  return supabase.from("users").delete().eq("id", userId)
}

export function updateUserRecord(supabase: AnySupabaseClient, userId: string, data: AdminUserUpdateInput) {
  return supabase
    .from("users")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
}
