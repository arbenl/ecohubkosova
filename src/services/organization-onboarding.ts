import { unstable_noStore as noStore } from "next/cache"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { organizationMembers, organizations, users, ecoOrganizations } from "@/db/schema"

/**
 * Organization onboarding service
 * Handles creation, claiming, and membership management for organizations
 */

export interface CreateOrganizationInput {
  name: string
  description: string
  primary_interest: string
  contact_person: string
  contact_email: string
  location: string
  type: string // OJQ, Ndërmarrje Sociale, Kompani
}

export interface UserOrganization {
  id: string
  name: string
  description: string
  primary_interest: string
  contact_person: string
  contact_email: string
  location: string
  type: string
  is_approved: boolean
  verification_status: string | null
  role_in_organization: string
  created_at: string
}

export interface OnboardingResult {
  data?: { organizationId: string }
  error?: string
}

/**
 * Create a new organization and add user as ADMIN
 */
export async function createOrganizationForUser(
  userId: string,
  input: CreateOrganizationInput
): Promise<OnboardingResult> {
  try {
    // Verify user exists
    const userRecord = await db.get().select().from(users).where(eq(users.id, userId)).limit(1)
    if (!userRecord[0]) {
      return { error: "Përdoruesi nuk u gjet." }
    }

    let createdOrgId: string | null = null

    await db.get().transaction(async (tx) => {
      const result = await tx
        .insert(organizations)
        .values({
          name: input.name,
          description: input.description,
          primary_interest: input.primary_interest,
          contact_person: input.contact_person,
          contact_email: input.contact_email,
          location: input.location,
          type: input.type,
          is_approved: false, // New orgs require admin approval
        })
        .returning({ id: organizations.id })

      if (!result[0]) {
        throw new Error("Nuk u arrit të krijohet organizata.")
      }

      createdOrgId = result[0].id

      // Add user as ADMIN member
      await tx.insert(organizationMembers).values({
        organization_id: createdOrgId,
        user_id: userId,
        role_in_organization: "admin",
        is_approved: true,
      })

      // Map legacy type to V2 org_role
      let orgRole: "NGO" | "PRODUCER" | "SERVICE_PROVIDER" = "PRODUCER"
      if (input.type === "OJQ") orgRole = "NGO"
      else if (input.type === "Ndërmarrje Sociale") orgRole = "SERVICE_PROVIDER"

      // Create eco_organization entry (required for V2)
      await tx.insert(ecoOrganizations).values({
        organization_id: createdOrgId,
        org_role: orgRole,
        verification_status: "UNVERIFIED",
      })
    })

    if (!createdOrgId) {
      return { error: "Nuk u arrit të krijohet organizata." }
    }

    return { data: { organizationId: createdOrgId } }
  } catch (error) {
    console.error("[organization-onboarding] createOrganizationForUser failed:", error)
    return { error: error instanceof Error ? error.message : "Gabim gjatë krijimit të organizatës." }
  }
}

/**
 * Claim an existing organization for a user
 * For now, immediately approves the membership (TODO: future phase could require approval)
 */
export async function claimOrganizationForUser(
  userId: string,
  organizationId: string
): Promise<OnboardingResult> {
  try {
    // Verify user exists
    const userRecord = await db.get().select().from(users).where(eq(users.id, userId)).limit(1)
    if (!userRecord[0]) {
      return { error: "Përdoruesi nuk u gjet." }
    }

    // Verify organization exists
    const orgRecord = await db.get().select().from(organizations).where(eq(organizations.id, organizationId)).limit(1)
    if (!orgRecord[0]) {
      return { error: "Organizata nuk u gjet." }
    }

    // Check if user is already a member
    const existingMembership = await db
      .get()
      .select()
      .from(organizationMembers)
      .where(and(eq(organizationMembers.user_id, userId), eq(organizationMembers.organization_id, organizationId)))
      .limit(1)

    if (existingMembership[0]) {
      return { error: "Ju jeni tashmë anëtar i kësaj organizate." }
    }

    // Add user as EDITOR member (for claimed orgs)
    // TODO: Future phase could make this request-based with admin approval
    await db.get().insert(organizationMembers).values({
      organization_id: organizationId,
      user_id: userId,
      role_in_organization: "editor",
      is_approved: true,
    })

    return { data: { organizationId } }
  } catch (error) {
    console.error("[organization-onboarding] claimOrganizationForUser failed:", error)
    return { error: error instanceof Error ? error.message : "Gabim gjatë kërkesës për organizatën." }
  }
}

/**
 * Fetch all organizations for a user where user is a member
 */
export async function fetchUserOrganizations(userId: string): Promise<{ data: UserOrganization[]; error?: string }> {
  noStore()

  try {
    const rows = await db
      .get()
      .select({
        organization: organizations,
        member: organizationMembers,
        ecoOrg: ecoOrganizations,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organization_id, organizations.id))
      .leftJoin(ecoOrganizations, eq(organizations.id, ecoOrganizations.organization_id))
      .where(eq(organizationMembers.user_id, userId))

    const data: UserOrganization[] = rows.map(({ organization, member, ecoOrg }) => ({
      id: organization.id,
      name: organization.name,
      description: organization.description,
      primary_interest: organization.primary_interest,
      contact_person: organization.contact_person,
      contact_email: organization.contact_email,
      location: organization.location,
      type: organization.type,
      is_approved: organization.is_approved,
      verification_status: ecoOrg?.verification_status ?? "UNVERIFIED",
      role_in_organization: member.role_in_organization,
      created_at: organization.created_at.toISOString(),
    }))

    return { data }
  } catch (error) {
    console.error("[organization-onboarding] fetchUserOrganizations failed:", error)
    return {
      data: [],
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të organizatave.",
    }
  }
}

/**
 * Check if user is member of at least one organization
 */
export async function isUserOrgMember(userId: string): Promise<boolean> {
  try {
    const result = await db
      .get()
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(eq(organizationMembers.user_id, userId))
      .limit(1)

    return result.length > 0
  } catch (error) {
    console.error("[organization-onboarding] isUserOrgMember failed:", error)
    return false
  }
}

/**
 * Fetch a single organization by ID with membership info for a user
 */
export async function fetchUserOrganization(
  userId: string,
  organizationId: string
): Promise<{ data: UserOrganization | null; error?: string }> {
  noStore()

  try {
    const rows = await db
      .get()
      .select({
        organization: organizations,
        member: organizationMembers,
        ecoOrg: ecoOrganizations,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organization_id, organizations.id))
      .leftJoin(ecoOrganizations, eq(organizations.id, ecoOrganizations.organization_id))
      .where(and(eq(organizationMembers.user_id, userId), eq(organizationMembers.organization_id, organizationId)))
      .limit(1)

    if (!rows[0]) {
      return { data: null, error: "Organizata nuk u gjet ose nuk jeni anëtar." }
    }

    const { organization, member, ecoOrg } = rows[0]

    return {
      data: {
        id: organization.id,
        name: organization.name,
        description: organization.description,
        primary_interest: organization.primary_interest,
        contact_person: organization.contact_person,
        contact_email: organization.contact_email,
        location: organization.location,
        type: organization.type,
        is_approved: organization.is_approved,
        verification_status: ecoOrg?.verification_status ?? "UNVERIFIED",
        role_in_organization: member.role_in_organization,
        created_at: organization.created_at.toISOString(),
      },
    }
  } catch (error) {
    console.error("[organization-onboarding] fetchUserOrganization failed:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të organizatës.",
    }
  }
}

/**
 * Organization onboarding service
 * Handles creation, claiming, and membership management for organizations
 */


