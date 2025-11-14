import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { AdminOrganizationUpdateInput } from "@/validation/admin"
export type { AdminOrganizationUpdateInput } from "@/validation/admin"

export interface AdminOrganization {
  id: string
  emri: string
  pershkrimi: string
  interesi_primar: string
  person_kontakti: string
  email_kontakti: string
  vendndodhja: string
  lloji: string
  eshte_aprovuar: boolean
  created_at: string
  updated_at: string | null
}

type AnySupabaseClient = SupabaseClient<any, any, any>

export async function fetchAdminOrganizations() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("organizations").select("*")
  return { data: data ?? [], error }
}

export function deleteOrganizationRecord(supabase: AnySupabaseClient, organizationId: string) {
  return supabase.from("organizations").delete().eq("id", organizationId)
}

export function updateOrganizationRecord(
  supabase: AnySupabaseClient,
  organizationId: string,
  data: AdminOrganizationUpdateInput
) {
  return supabase
    .from("organizations")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", organizationId)
}
