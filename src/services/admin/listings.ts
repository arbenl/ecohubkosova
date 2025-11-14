import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { AdminListingUpdateInput } from "@/validation/admin"
export type { AdminListingUpdateInput } from "@/validation/admin"

export interface AdminListing {
  id: string
  created_by_user_id: string
  organization_id: string | null
  titulli: string
  pershkrimi: string
  kategori: string
  cmimi: number
  njesia: string
  vendndodhja: string
  sasia: string
  lloji_listimit: string
  eshte_aprovuar: boolean
  created_at: string
  updated_at: string | null
}

type AnySupabaseClient = SupabaseClient<any, any, any>

export async function fetchAdminListings() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("tregu_listime").select("*")
  return { data: data ?? [], error }
}

export function deleteListingRecord(supabase: AnySupabaseClient, listingId: string) {
  return supabase.from("tregu_listime").delete().eq("id", listingId)
}

export function updateListingRecord(
  supabase: AnySupabaseClient,
  listingId: string,
  data: AdminListingUpdateInput
) {
  return supabase
    .from("tregu_listime")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId)
}
