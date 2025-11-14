import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

export interface AdminOrganizationMember {
  id: string
  organization_id: string
  user_id: string
  roli_ne_organizate: string
  eshte_aprovuar: boolean
  created_at: string
}

export interface AdminOrganizationMemberWithDetails extends AdminOrganizationMember {
  organization_name?: string
  user_name?: string
  user_email?: string
}

export interface AdminOrganizationMemberUpdateInput {
  roli_ne_organizate: string
  eshte_aprovuar: boolean
}

type AnySupabaseClient = SupabaseClient<any, any, any>

export async function fetchAdminOrganizationMembers() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("organization_members").select(`
      *,
      organizations!inner(emri),
      users!inner(emri_i_plote, email)
    `)

  const formatted =
    data?.map((member: any) => ({
      ...member,
      organization_name: member.organizations?.emri,
      user_name: member.users?.emri_i_plote,
      user_email: member.users?.email,
    })) ?? []

  return { data: formatted, error }
}

export function deleteOrganizationMemberRecord(supabase: AnySupabaseClient, memberId: string) {
  return supabase.from("organization_members").delete().eq("id", memberId)
}

export function updateOrganizationMemberRecord(
  supabase: AnySupabaseClient,
  memberId: string,
  data: AdminOrganizationMemberUpdateInput
) {
  return supabase
    .from("organization_members")
    .update({
      roli_ne_organizate: data.roli_ne_organizate,
      eshte_aprovuar: data.eshte_aprovuar,
    })
    .eq("id", memberId)
}

export function toggleOrganizationMemberApprovalRecord(
  supabase: AnySupabaseClient,
  memberId: string,
  currentStatus: boolean
) {
  return supabase.from("organization_members").update({ eshte_aprovuar: !currentStatus }).eq("id", memberId)
}
