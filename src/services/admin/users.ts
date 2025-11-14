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
    return { data: null, error: error as Error }
  }
}

export async function deleteUserRecord(userId: string) {
  try {
    await db.get().delete(users).where(eq(users.id, userId))
    return { error: null }
  } catch (error) {
    return { error: error as Error }
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
    return { error: error as Error }
  }
}
