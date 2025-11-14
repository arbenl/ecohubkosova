import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { organizations } from "@/db/schema"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { AdminOrganizationUpdateInput } from "@/validation/admin"
export type { AdminOrganizationUpdateInput } from "@/validation/admin"

export type AdminOrganizationRow = typeof organizations.$inferSelect

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

const ORGANIZATIONS_TABLE = "organizations"

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

async function fetchAdminOrganizationsViaSupabase() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from(ORGANIZATIONS_TABLE).select("*")

  if (error) {
    return { data: null, error: toError(error) }
  }

  const serialized: AdminOrganization[] =
    (data ?? []).map((org: Record<string, any>) => ({
      ...org,
      created_at: formatTimestamp(org.created_at) ?? "",
      updated_at: formatTimestamp(org.updated_at),
    })) ?? []

  return { data: serialized, error: null }
}

async function deleteOrganizationViaSupabase(organizationId: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from(ORGANIZATIONS_TABLE).delete().eq("id", organizationId)
  return { error: toError(error) }
}

async function updateOrganizationViaSupabase(organizationId: string, data: AdminOrganizationUpdateInput) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from(ORGANIZATIONS_TABLE)
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", organizationId)

  return { error: toError(error) }
}

export async function fetchAdminOrganizations() {
  try {
    const rows = await db.get().select().from(organizations)
    const serialized: AdminOrganization[] = rows.map((org) => ({
      ...org,
      created_at: org.created_at.toISOString(),
      updated_at: org.updated_at ? org.updated_at.toISOString() : null,
    }))
    return { data: serialized, error: null }
  } catch (error) {
    console.warn("[services/admin/organizations] Drizzle fetch failed; falling back to Supabase REST.", error)
    return fetchAdminOrganizationsViaSupabase()
  }
}

export async function deleteOrganizationRecord(organizationId: string) {
  try {
    await db.get().delete(organizations).where(eq(organizations.id, organizationId))
    return { error: null }
  } catch (error) {
    console.warn("[services/admin/organizations] Drizzle delete failed; falling back to Supabase REST.", error)
    return deleteOrganizationViaSupabase(organizationId)
  }
}

export async function updateOrganizationRecord(
  organizationId: string,
  data: AdminOrganizationUpdateInput
) {
  try {
    await db
      .get()
      .update(organizations)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(organizations.id, organizationId))

    return { error: null }
  } catch (error) {
    console.warn("[services/admin/organizations] Drizzle update failed; falling back to Supabase REST.", error)
    return updateOrganizationViaSupabase(organizationId, data)
  }
}
