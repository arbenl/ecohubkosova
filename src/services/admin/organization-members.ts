import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { organizationMembers, organizations, users } from "@/db/schema"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { AdminOrganizationMemberUpdateInput } from "@/validation/admin"
export type { AdminOrganizationMemberUpdateInput } from "@/validation/admin"

export type AdminOrganizationMemberRow = typeof organizationMembers.$inferSelect

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

const MEMBERS_TABLE = "organization_members"

const formatTimestamp = (value: Date | string | null | undefined) => {
  if (!value) {
    return null
  }
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

const toError = (error: unknown) => {
  if (!error) {
    return null
  }
  return error instanceof Error ? error : new Error(typeof error === "object" && error && "message" in error ? String((error as any).message) : "Supabase error")
}

async function fetchMembersViaSupabase() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from(MEMBERS_TABLE)
    .select(
      `
        id,
        organization_id,
        user_id,
        roli_ne_organizate,
        eshte_aprovuar,
        created_at,
        organizations!inner(emri),
        users!inner(emri_i_plote, email)
      `
    )

  if (error) {
    return { data: null, error: toError(error) }
  }

  const formatted: AdminOrganizationMemberWithDetails[] =
    (data ?? []).map((record: any) => ({
      id: record.id,
      organization_id: record.organization_id,
      user_id: record.user_id,
      roli_ne_organizate: record.roli_ne_organizate,
      eshte_aprovuar: record.eshte_aprovuar,
      created_at: formatTimestamp(record.created_at) ?? "",
      organization_name: record.organizations?.emri,
      user_name: record.users?.emri_i_plote,
      user_email: record.users?.email,
    })) ?? []

  return { data: formatted, error: null }
}

async function deleteMemberViaSupabase(memberId: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from(MEMBERS_TABLE).delete().eq("id", memberId)
  return { error: toError(error) }
}

async function updateMemberViaSupabase(memberId: string, data: AdminOrganizationMemberUpdateInput) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from(MEMBERS_TABLE)
    .update({
      roli_ne_organizate: data.roli_ne_organizate,
      eshte_aprovuar: data.eshte_aprovuar,
    })
    .eq("id", memberId)

  return { error: toError(error) }
}

async function toggleMemberViaSupabase(memberId: string, nextStatus: boolean) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from(MEMBERS_TABLE).update({ eshte_aprovuar: nextStatus }).eq("id", memberId)
  return { error: toError(error) }
}

export async function fetchAdminOrganizationMembers() {
  try {
    const rows = await db
      .get()
      .select({
        member: organizationMembers,
        organization_name: organizations.emri,
        user_name: users.emri_i_plote,
        user_email: users.email,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organization_id, organizations.id))
      .innerJoin(users, eq(organizationMembers.user_id, users.id))

    const formatted: AdminOrganizationMemberWithDetails[] = rows.map(({ member, organization_name, user_name, user_email }) => ({
      ...member,
      created_at: member.created_at.toISOString(),
      organization_name,
      user_name,
      user_email,
    }))

    return { data: formatted, error: null }
  } catch (error) {
    console.warn("[services/admin/organization-members] Drizzle fetch failed; falling back to Supabase REST.", error)
    return fetchMembersViaSupabase()
  }
}

export async function deleteOrganizationMemberRecord(memberId: string) {
  try {
    await db.get().delete(organizationMembers).where(eq(organizationMembers.id, memberId))
    return { error: null }
  } catch (error) {
    console.warn("[services/admin/organization-members] Drizzle delete failed; falling back to Supabase REST.", error)
    return deleteMemberViaSupabase(memberId)
  }
}

export async function updateOrganizationMemberRecord(
  memberId: string,
  data: AdminOrganizationMemberUpdateInput
) {
  try {
    await db
      .get()
      .update(organizationMembers)
      .set({
        roli_ne_organizate: data.roli_ne_organizate,
        eshte_aprovuar: data.eshte_aprovuar,
      })
      .where(eq(organizationMembers.id, memberId))

    return { error: null }
  } catch (error) {
    console.warn("[services/admin/organization-members] Drizzle update failed; falling back to Supabase REST.", error)
    return updateMemberViaSupabase(memberId, data)
  }
}

export async function toggleOrganizationMemberApprovalRecord(memberId: string, currentStatus: boolean) {
  try {
    await db
      .get()
      .update(organizationMembers)
      .set({ eshte_aprovuar: !currentStatus })
      .where(eq(organizationMembers.id, memberId))

    return { error: null }
  } catch (error) {
    console.warn("[services/admin/organization-members] Drizzle approval toggle failed; falling back to Supabase REST.", error)
    return toggleMemberViaSupabase(memberId, !currentStatus)
  }
}
