import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
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

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(typeof error === "string" ? error : "Gabim i panjohur.")

const serializeUser = (user: AdminUserRow): AdminUser => ({
  ...user,
  created_at: user.created_at.toISOString(),
  updated_at: user.updated_at ? user.updated_at.toISOString() : null,
})

export async function fetchAdminUsers() {
  try {
    const rows = await db.get().select().from(users)
    return { data: rows.map(serializeUser), error: null }
  } catch (error) {
    console.error("[services/admin/users] Failed to fetch users:", error)
    return { data: null, error: toError(error) }
  }
}

export async function deleteUserRecord(userId: string) {
  try {
    await db.get().delete(users).where(eq(users.id, userId))
    return { error: null }
  } catch (error) {
    console.error("[services/admin/users] Failed to delete user:", error)
    return { error: toError(error) }
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
    console.error("[services/admin/users] Failed to update user:", error)
    return { error: toError(error) }
  }
}
