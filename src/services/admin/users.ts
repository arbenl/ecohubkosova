import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { AdminUserUpdateInput } from "@/validation/admin"
export type { AdminUserUpdateInput } from "@/validation/admin"

export type AdminUserRow = typeof users.$inferSelect

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

const USERS_TABLE = "users"

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

async function fetchAdminUsersViaSupabase() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from(USERS_TABLE).select("*")

  if (error) {
    return { data: null, error: toError(error) }
  }

  const serialized =
    ((data ?? []).map((user: Record<string, any>) => ({
      ...user,
      created_at: formatTimestamp(user.created_at) ?? "",
      updated_at: formatTimestamp(user.updated_at),
    })) ?? []) as AdminUser[]

  return { data: serialized, error: null }
}

async function deleteUserViaSupabase(userId: string) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from(USERS_TABLE).delete().eq("id", userId)
  return { error: toError(error) }
}

async function updateUserViaSupabase(userId: string, data: AdminUserUpdateInput) {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from(USERS_TABLE)
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  return { error: toError(error) }
}

export async function fetchAdminUsers() {
  try {
    const rows = await db.get().select().from(users)
    const serialized: AdminUser[] = rows.map((user) => ({
      ...user,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at ? user.updated_at.toISOString() : null,
    }))

    return { data: serialized, error: null }
  } catch (error) {
    console.warn("[services/admin/users] Drizzle fetch failed; falling back to Supabase REST.", error)
    return fetchAdminUsersViaSupabase()
  }
}

export async function deleteUserRecord(userId: string) {
  try {
    await db.get().delete(users).where(eq(users.id, userId))
    return { error: null }
  } catch (error) {
    console.warn("[services/admin/users] Drizzle delete failed; falling back to Supabase REST.", error)
    return deleteUserViaSupabase(userId)
  }
}

export async function updateUserRecord(userId: string, data: AdminUserUpdateInput) {
  try {
    await db
      .get()
      .update(users)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId))

    return { error: null }
  } catch (error) {
    console.warn("[services/admin/users] Drizzle update failed; falling back to Supabase REST.", error)
    return updateUserViaSupabase(userId, data)
  }
}
