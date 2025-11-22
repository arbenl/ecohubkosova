"use server"

import { getServerUser } from "@/lib/supabase/server"
import {
  getOrganizationMembers,
  getOrganizationInvites,
  inviteMemberToOrganization,
  revokeInvite,
  changeMemberRole,
  removeMember,
  acceptInvite,
  getInviteByToken,
} from "@/services/organization-members"

export async function fetchOrganizationMembersAction(organizationId: string) {
  try {
    const { user, error: authError } = await getServerUser()
    if (!user || authError) {
      return { data: null, error: "Not authenticated" }
    }

    const result = await getOrganizationMembers(organizationId)
    return result
  } catch (error) {
    console.error("Error in fetchOrganizationMembersAction:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch members" }
  }
}

export async function fetchPendingInvitesAction(organizationId: string) {
  try {
    const { user, error: authError } = await getServerUser()
    if (!user || authError) {
      return { data: null, error: "Not authenticated" }
    }

    const result = await getOrganizationInvites(organizationId)
    return result
  } catch (error) {
    console.error("Error in fetchPendingInvitesAction:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch invites" }
  }
}

export async function sendInviteAction(
  organizationId: string,
  email: string,
  role: "ADMIN" | "EDITOR" | "VIEWER"
) {
  try {
    const { user, error: authError } = await getServerUser()
    if (!user || authError) {
      return { data: null, error: "Not authenticated" }
    }

    const result = await inviteMemberToOrganization({
      organizationId,
      inviterUserId: user.id,
      email,
      role,
    })

    return result
  } catch (error) {
    console.error("Error in sendInviteAction:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to send invite" }
  }
}

export async function revokeInviteAction(inviteId: string, organizationId: string) {
  try {
    const { user, error: authError } = await getServerUser()
    if (!user || authError) {
      return { error: "Not authenticated" }
    }

    const result = await revokeInvite({
      inviteId,
      requesterUserId: user.id,
      organizationId,
    })

    return result
  } catch (error) {
    console.error("Error in revokeInviteAction:", error)
    return { error: error instanceof Error ? error.message : "Failed to revoke invite" }
  }
}

export async function changeRoleAction(
  organizationId: string,
  targetUserId: string,
  newRole: "ADMIN" | "EDITOR" | "VIEWER"
) {
  try {
    const { user, error: authError } = await getServerUser()
    if (!user || authError) {
      return { error: "Not authenticated" }
    }

    const result = await changeMemberRole({
      organizationId,
      targetUserId,
      newRole,
      requesterUserId: user.id,
    })

    return result
  } catch (error) {
    console.error("Error in changeRoleAction:", error)
    return { error: error instanceof Error ? error.message : "Failed to change role" }
  }
}

export async function removeMemberAction(organizationId: string, targetUserId: string) {
  try {
    const { user, error: authError } = await getServerUser()
    if (!user || authError) {
      return { error: "Not authenticated" }
    }

    const result = await removeMember({
      organizationId,
      targetUserId,
      requesterUserId: user.id,
    })

    return result
  } catch (error) {
    console.error("Error in removeMemberAction:", error)
    return { error: error instanceof Error ? error.message : "Failed to remove member" }
  }
}

export async function acceptInviteAction(token: string) {
  try {
    const { user, error: authError } = await getServerUser()
    if (!user || authError) {
      return { data: null, error: "Not authenticated" }
    }

    const result = await acceptInvite({
      token,
      userId: user.id,
      userEmail: user.email || "",
    })

    return result
  } catch (error) {
    console.error("Error in acceptInviteAction:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to accept invite" }
  }
}

export async function getInviteDetailsAction(token: string) {
  try {
    const result = await getInviteByToken(token)
    return result
  } catch (error) {
    console.error("Error in getInviteDetailsAction:", error)
    return { data: null, error: error instanceof Error ? error.message : "Failed to get invite details" }
  }
}
