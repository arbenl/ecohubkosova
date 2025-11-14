import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { organizations } from "@/db/schema"
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
    return { data: null, error: error as Error }
  }
}

export async function deleteOrganizationRecord(organizationId: string) {
  try {
    await db.get().delete(organizations).where(eq(organizations.id, organizationId))
    return { error: null }
  } catch (error) {
    return { error: error as Error }
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
    return { error: error as Error }
  }
}
