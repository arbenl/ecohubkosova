import { eq, and } from "drizzle-orm"
import { randomBytes } from "crypto"
import { db } from "@/lib/drizzle"
import { organizationMembers, organizations, users } from "@/db/schema"

export interface OrganizationMemberInfo {
  id: string
  user_id: string
  name: string
  email: string
  role: string
  joined_at: string
  can_manage: boolean // whether current user can manage this member
}

export interface OrganizationInvite {
  id: string
  email: string
  role: string
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED"
  created_at: string
  created_by_user_id: string
  token: string
}

export interface PendingInvite {
  id: string
  email: string
  role: string
  created_at: string
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED"
}

const toError = (error: unknown) =>
  error instanceof Error
    ? error
    : new Error(typeof error === "string" ? error : "Unknown error")

function generateInviteToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Execute a raw SQL query using the database connection
 * Used for tables not yet defined in Drizzle schema (like organization_member_invites)
 */
async function executeRawQuery(sql: string, params: any[] = []) {
  try {
    const client = (db.get() as any)._.client
    if (!client) {
      throw new Error("Database client not available")
    }
    const result = await client.query(sql, params)
    return result.rows || []
  } catch (error) {
    console.error("Raw query error:", error)
    throw error
  }
}

/**
 * Get members of an organization with their user details
 */
export async function getOrganizationMembers(organizationId: string) {
  try {
    const rows = await db
      .get()
      .select({
        member: organizationMembers,
        user_name: users.full_name,
        user_email: users.email,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.user_id, users.id))
      .where(eq(organizationMembers.organization_id, organizationId))

    const formatted: OrganizationMemberInfo[] = rows.map(
      ({ member, user_name, user_email }) => ({
        id: member.id,
        user_id: member.user_id,
        name: user_name,
        email: user_email,
        role: member.role_in_organization,
        joined_at: member.created_at.toISOString(),
        can_manage: false, // Will be set by caller based on requester role
      })
    )

    return { data: formatted, error: null }
  } catch (error) {
    console.error("[services/organization-members] Failed to fetch members:", error)
    return { data: null, error: toError(error) }
  }
}

/**
 * Get pending invites for an organization
 */
export async function getOrganizationInvites(organizationId: string) {
  try {
    const invites = await executeRawQuery(
      `SELECT id, email, role_in_organization as role, status, created_at, token
       FROM public.organization_member_invites
       WHERE organization_id = $1
         AND status IN ('PENDING', 'ACCEPTED')
       ORDER BY created_at DESC`,
      [organizationId]
    )

    return { data: (invites || []) as PendingInvite[], error: null }
  } catch (error) {
    console.error("[services/organization-members] Failed to fetch invites:", error)
    return { data: null, error: toError(error) }
  }
}

/**
 * Invite a member by email
 */
export async function inviteMemberToOrganization(params: {
  organizationId: string
  inviterUserId: string
  email: string
  role: "ADMIN" | "EDITOR" | "VIEWER"
}) {
  try {
    const { organizationId, inviterUserId, email, role } = params

    // Verify inviter is ADMIN of org
    const inviterRecords = await db
      .get()
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organization_id, organizationId),
          eq(organizationMembers.user_id, inviterUserId),
          eq(organizationMembers.role_in_organization, "ADMIN"),
          eq(organizationMembers.is_approved, true)
        )
      )
      .limit(1)

    if (!inviterRecords[0]) {
      return {
        data: null,
        error: new Error("Only organization administrators can invite members"),
      }
    }

    // Generate invite token
    const token = generateInviteToken()

    // Insert invite into database
    try {
      await executeRawQuery(
        `INSERT INTO public.organization_member_invites 
         (organization_id, email, role_in_organization, token, status, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (organization_id, email, status) WHERE status = 'PENDING'
         DO NOTHING`,
        [organizationId, email, role, token, "PENDING", inviterUserId]
      )
    } catch (queryError) {
      console.error("Failed to insert invite:", queryError)
      return { data: null, error: toError(queryError) }
    }

    return {
      data: {
        token,
        email,
        role,
        organizationId,
      },
      error: null,
    }
  } catch (error) {
    console.error("[services/organization-members] Failed to invite member:", error)
    return { data: null, error: toError(error) }
  }
}

/**
 * Revoke an invite
 */
export async function revokeInvite(params: {
  inviteId: string
  requesterUserId: string
  organizationId: string
}) {
  try {
    const { inviteId, requesterUserId, organizationId } = params

    // Verify requester is ADMIN
    const requesterRecords = await db
      .get()
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organization_id, organizationId),
          eq(organizationMembers.user_id, requesterUserId),
          eq(organizationMembers.role_in_organization, "ADMIN"),
          eq(organizationMembers.is_approved, true)
        )
      )
      .limit(1)

    if (!requesterRecords[0]) {
      return {
        error: new Error("Only organization administrators can revoke invites"),
      }
    }

    // Update invite status to REVOKED
    try {
      await executeRawQuery(
        `UPDATE public.organization_member_invites 
         SET status = $1, updated_at = now()
         WHERE id = $2`,
        ["REVOKED", inviteId]
      )
    } catch (queryError) {
      console.error("Failed to revoke invite:", queryError)
      return { error: toError(queryError) }
    }

    return { error: null }
  } catch (error) {
    console.error("[services/organization-members] Failed to revoke invite:", error)
    return { error: toError(error) }
  }
}

/**
 * Change member role
 */
export async function changeMemberRole(params: {
  organizationId: string
  targetUserId: string
  newRole: "ADMIN" | "EDITOR" | "VIEWER"
  requesterUserId: string
}) {
  try {
    const { organizationId, targetUserId, newRole, requesterUserId } = params

    // Verify requester is ADMIN
    const requesterRecords = await db
      .get()
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organization_id, organizationId),
          eq(organizationMembers.user_id, requesterUserId),
          eq(organizationMembers.role_in_organization, "ADMIN"),
          eq(organizationMembers.is_approved, true)
        )
      )
      .limit(1)

    if (!requesterRecords[0]) {
      return {
        error: new Error("Only organization administrators can change roles"),
      }
    }

    // Prevent self-demotion from last ADMIN
    if (requesterUserId === targetUserId && newRole !== "ADMIN") {
      const adminCount = await db
        .get()
        .select({ id: organizationMembers.id })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organization_id, organizationId),
            eq(organizationMembers.role_in_organization, "ADMIN"),
            eq(organizationMembers.is_approved, true)
          )
        )

      if (adminCount.length <= 1) {
        return {
          error: new Error("Cannot demote last administrator"),
        }
      }
    }

    // Update role
    await db
      .get()
      .update(organizationMembers)
      .set({ role_in_organization: newRole })
      .where(
        and(
          eq(organizationMembers.organization_id, organizationId),
          eq(organizationMembers.user_id, targetUserId)
        )
      )

    return { error: null }
  } catch (error) {
    console.error("[services/organization-members] Failed to change role:", error)
    return { error: toError(error) }
  }
}

/**
 * Remove member from organization
 */
export async function removeMember(params: {
  organizationId: string
  targetUserId: string
  requesterUserId: string
}) {
  try {
    const { organizationId, targetUserId, requesterUserId } = params

    // User can remove themselves, or requester must be ADMIN
    const canRemove =
      requesterUserId === targetUserId ||
      (
        await db
          .get()
          .select({ id: organizationMembers.id })
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organization_id, organizationId),
              eq(organizationMembers.user_id, requesterUserId),
              eq(organizationMembers.role_in_organization, "ADMIN"),
              eq(organizationMembers.is_approved, true)
            )
          )
          .limit(1)
      )[0]

    if (!canRemove) {
      return {
        error: new Error("Only organization administrators can remove members"),
      }
    }

    // Prevent removal of last ADMIN
    if (requesterUserId !== targetUserId) {
      const targetMember = await db
        .get()
        .select({ role_in_organization: organizationMembers.role_in_organization })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organization_id, organizationId),
            eq(organizationMembers.user_id, targetUserId)
          )
        )
        .limit(1)

      if (targetMember[0]?.role_in_organization === "ADMIN") {
        const adminCount = await db
          .get()
          .select({ id: organizationMembers.id })
          .from(organizationMembers)
          .where(
            and(
              eq(organizationMembers.organization_id, organizationId),
              eq(organizationMembers.role_in_organization, "ADMIN"),
              eq(organizationMembers.is_approved, true)
            )
          )

        if (adminCount.length <= 1) {
          return {
            error: new Error("Cannot remove last administrator"),
          }
        }
      }
    }

    // Delete member
    await db
      .get()
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organization_id, organizationId),
          eq(organizationMembers.user_id, targetUserId)
        )
      )

    return { error: null }
  } catch (error) {
    console.error("[services/organization-members] Failed to remove member:", error)
    return { error: toError(error) }
  }
}

/**
 * Accept an invite
 */
export async function acceptInvite(params: {
  token: string
  userId: string
  userEmail: string
}) {
  try {
    const { token, userId, userEmail } = params

    // Find and validate invite
    let inviteRecord: any

    try {
      const results = await executeRawQuery(
        `SELECT id, organization_id, email, role_in_organization as role, status
         FROM public.organization_member_invites
         WHERE token = $1`,
        [token]
      )
      inviteRecord = results[0] || null
    } catch (queryError) {
      console.error("Failed to find invite:", queryError)
      return { data: null, error: new Error("Invitation not found or invalid") }
    }

    if (!inviteRecord) {
      return { data: null, error: new Error("Invitation not found") }
    }

    if (inviteRecord.status !== "PENDING") {
      return { data: null, error: new Error("This invitation is no longer valid") }
    }

    if (inviteRecord.email.toLowerCase() !== userEmail.toLowerCase()) {
      return {
        data: null,
        error: new Error("Invitation email does not match your account"),
      }
    }

    const organizationId = inviteRecord.organization_id
    const role = inviteRecord.role

    // Check if user is already member
    const existingRecords = await db
      .get()
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organization_id, organizationId),
          eq(organizationMembers.user_id, userId)
        )
      )
      .limit(1)

    if (existingRecords[0]) {
      // Already a member - mark invite as accepted but don't create duplicate
      try {
        await executeRawQuery(
          `UPDATE public.organization_member_invites 
           SET status = $1, accepted_at = now(), updated_at = now()
           WHERE id = $2`,
          ["ACCEPTED", inviteRecord.id]
        )
      } catch (updateError) {
        console.error("Failed to mark invite as accepted:", updateError)
      }

      return {
        data: { organizationId },
        error: null,
      }
    }

    // Create member record
    await db.get().insert(organizationMembers).values({
      organization_id: organizationId,
      user_id: userId,
      role_in_organization: role,
      is_approved: true,
    })

    // Mark invite as accepted
    try {
      await executeRawQuery(
        `UPDATE public.organization_member_invites 
         SET status = $1, accepted_at = now(), updated_at = now()
         WHERE id = $2`,
        ["ACCEPTED", inviteRecord.id]
      )
    } catch (updateError) {
      console.error("Failed to mark invite as accepted:", updateError)
    }

    return {
      data: { organizationId },
      error: null,
    }
  } catch (error) {
    console.error("[services/organization-members] Failed to accept invite:", error)
    return { data: null, error: toError(error) }
  }
}

/**
 * Get invite details by token (for public/unauthenticated access)
 */
export async function getInviteByToken(token: string) {
  try {
    let inviteRecord: any

    try {
      const results = await executeRawQuery(
        `SELECT omi.id, omi.email, omi.role_in_organization as role, omi.status, 
                o.id as organization_id, o.name as organization_name
         FROM public.organization_member_invites omi
         JOIN public.organizations o ON o.id = omi.organization_id
         WHERE omi.token = $1`,
        [token]
      )
      inviteRecord = results[0] || null
    } catch (queryError) {
      console.error("Failed to find invite by token:", queryError)
      return { data: null, error: new Error("Invitation not found") }
    }

    if (!inviteRecord) {
      return { data: null, error: new Error("Invitation not found") }
    }

    if (inviteRecord.status !== "PENDING") {
      return {
        data: null,
        error: new Error("This invitation is no longer valid"),
      }
    }

    return {
      data: {
        id: inviteRecord.id,
        email: inviteRecord.email,
        role: inviteRecord.role,
        organizationId: inviteRecord.organization_id,
        organizationName: inviteRecord.organization_name,
      },
      error: null,
    }
  } catch (error) {
    console.error("[services/organization-members] Failed to get invite:", error)
    return { data: null, error: toError(error) }
  }
}
