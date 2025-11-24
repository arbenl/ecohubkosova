import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { ecoOrganizations, organizations } from "@/db/schema"

export type EcoOrgProfile = typeof ecoOrganizations.$inferSelect

export interface EcoOrgWithDetails extends EcoOrgProfile {
  organization_name: string
  organization_description: string
  organization_location: string
  organization_email: string
  organization_contact_person: string
}

export async function fetchEcoOrganizationById(
  organizationId: string
): Promise<EcoOrgWithDetails | null> {
  try {
    const rows = await db
      .get()
      .select({
        id: ecoOrganizations.id,
        organization_id: ecoOrganizations.organization_id,
        org_role: ecoOrganizations.org_role,
        verification_status: ecoOrganizations.verification_status,
        verification_source: ecoOrganizations.verification_source,
        verified_at: ecoOrganizations.verified_at,
        verified_by_user_id: ecoOrganizations.verified_by_user_id,
        certifications: ecoOrganizations.certifications,
        licenses: ecoOrganizations.licenses,
        waste_types_handled: ecoOrganizations.waste_types_handled,
        service_areas: ecoOrganizations.service_areas,
        processing_capacity: ecoOrganizations.processing_capacity,
        pickup_available: ecoOrganizations.pickup_available,
        delivery_available: ecoOrganizations.delivery_available,
        metadata: ecoOrganizations.metadata,
        total_listings: ecoOrganizations.total_listings,
        total_transactions: ecoOrganizations.total_transactions,
        created_at: ecoOrganizations.created_at,
        updated_at: ecoOrganizations.updated_at,
        organization_name: organizations.name,
        organization_description: organizations.description,
        organization_location: organizations.location,
        organization_email: organizations.contact_email,
        organization_contact_person: organizations.contact_person,
      })
      .from(ecoOrganizations)
      .innerJoin(organizations, eq(ecoOrganizations.organization_id, organizations.id))
      .where(eq(ecoOrganizations.organization_id, organizationId))
      .limit(1)

    return (rows[0] as unknown as EcoOrgWithDetails) || null
  } catch (error) {
    console.error("[eco-organizations] Failed to fetch organization:", error)
    return null
  }
}

export async function fetchEcoOrganizationsByRole(role: string): Promise<EcoOrgWithDetails[]> {
  try {
    const rows = await db
      .get()
      .select({
        id: ecoOrganizations.id,
        organization_id: ecoOrganizations.organization_id,
        org_role: ecoOrganizations.org_role,
        verification_status: ecoOrganizations.verification_status,
        verification_source: ecoOrganizations.verification_source,
        verified_at: ecoOrganizations.verified_at,
        verified_by_user_id: ecoOrganizations.verified_by_user_id,
        certifications: ecoOrganizations.certifications,
        licenses: ecoOrganizations.licenses,
        waste_types_handled: ecoOrganizations.waste_types_handled,
        service_areas: ecoOrganizations.service_areas,
        processing_capacity: ecoOrganizations.processing_capacity,
        pickup_available: ecoOrganizations.pickup_available,
        delivery_available: ecoOrganizations.delivery_available,
        metadata: ecoOrganizations.metadata,
        total_listings: ecoOrganizations.total_listings,
        total_transactions: ecoOrganizations.total_transactions,
        created_at: ecoOrganizations.created_at,
        updated_at: ecoOrganizations.updated_at,
        organization_name: organizations.name,
        organization_description: organizations.description,
        organization_location: organizations.location,
        organization_email: organizations.contact_email,
        organization_contact_person: organizations.contact_person,
      })
      .from(ecoOrganizations)
      .innerJoin(organizations, eq(ecoOrganizations.organization_id, organizations.id))
      .where(eq(ecoOrganizations.org_role, role as any))

    return rows as unknown as EcoOrgWithDetails[]
  } catch (error) {
    console.error("[eco-organizations] Failed to fetch organizations by role:", error)
    return []
  }
}
