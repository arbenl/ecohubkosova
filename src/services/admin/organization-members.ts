import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { organizationMembers, organizations, users } from "@/db/schema"
import type { AdminOrganizationMemberUpdateInput } from "@/validation/admin"
export type { AdminOrganizationMemberUpdateInput } from "@/validation/admin"

export type AdminOrganizationMemberRow = typeof organizationMembers.$inferSelect

export interface AdminOrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role_in_organization: string
  is_approved: boolean
  created_at: string
}

export interface AdminOrganizationMemberWithDetails extends AdminOrganizationMember {
  organization_name?: string
  user_name?: string
  user_email?: string
}

const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(typeof error === "string" ? error : "Gabim i panjohur.")

export async function fetchAdminOrganizationMembers() {
  try {
    const rows = await db
      .get()
      .select({
        member: organizationMembers,
        organization_name: organizations.name,
        user_name: users.full_name,
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
    console.error("[services/admin/organization-members] Failed to fetch members:", error)
    return { data: null, error: toError(error) }
  }
}

export async function deleteOrganizationMemberRecord(memberId: string) {
  try {
    await db.get().delete(organizationMembers).where(eq(organizationMembers.id, memberId))
    return { error: null }
  } catch (error) {
    console.error("[services/admin/organization-members] Failed to delete member:", error)
    return { error: toError(error) }
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
        role_in_organization: data.role_in_organization,
        is_approved: data.is_approved,
      })
      .where(eq(organizationMembers.id, memberId))

    return { error: null }
  } catch (error) {
    console.error("[services/admin/organization-members] Failed to update member:", error)
    return { error: toError(error) }
  }
}

export async function toggleOrganizationMemberApprovalRecord(memberId: string, currentStatus: boolean) {
  try {
    await db
      .get()
      .update(organizationMembers)
      .set({ is_approved: !currentStatus })
      .where(eq(organizationMembers.id, memberId))

    return { error: null }
  } catch (error) {
    console.error("[services/admin/organization-members] Failed to toggle approval:", error)
    return { error: toError(error) }
  }
}
