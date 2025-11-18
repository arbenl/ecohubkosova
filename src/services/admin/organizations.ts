import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { organizations } from "@/db/schema"
import type { AdminOrganizationUpdateInput } from "@/validation/admin"
export type { AdminOrganizationUpdateInput } from "@/validation/admin"

export type AdminOrganizationRow = typeof organizations.$inferSelect

export interface AdminOrganization {
  id: string
  name: string
  description: string
  primary_interest: string
  contact_person: string
  contact_email: string
  location: string
  type: string
  is_approved: boolean
  created_at: string
  updated_at: string | null
}

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(typeof error === "string" ? error : "Gabim i panjohur.")

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
    console.error("[services/admin/organizations] Failed to fetch organizations:", error)
    return { data: null, error: toError(error) }
  }
}

export async function deleteOrganizationRecord(organizationId: string) {
  try {
    await db.get().delete(organizations).where(eq(organizations.id, organizationId))
    return { error: null }
  } catch (error) {
    console.error("[services/admin/organizations] Failed to delete organization:", error)
    return { error: toError(error) }
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
    console.error("[services/admin/organizations] Failed to update organization:", error)
    return { error: toError(error) }
  }
}
