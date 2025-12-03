import { unstable_noStore as noStore } from "next/cache"
import { and, eq, inArray, sql, type SQL } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { ecoOrganizations, organizations } from "@/db/schema"

export type Partner = {
  id?: string
  eco_org_id: string
  organization_id: string
  name: string
  description: string | null
  location: string | null
  city: string | null // Derived from location
  org_role: string | null
  contact_email: string | null
  verification_status: string | null
  waste_types_handled: string[] | null
  service_areas: string[] | null
  primary_interest?: string | null
  organization_type?: string | null
}

export type PartnerDetail = Partner & {
  contact_person: string | null
  primary_interest: string | null
  organization_type: string | null
  metadata: Record<string, unknown> | null
  contact_phone: string | null
  website: string | null
}

type PartnerFilters = {
  roles?: string[]
  verifiedOnly?: boolean
  limit?: number
}

export async function fetchPartners({
  roles,
  verifiedOnly = false,
  limit,
}: PartnerFilters = {}): Promise<Partner[]> {
  noStore()

  try {
    const conditions: SQL[] = [eq(organizations.is_approved, true)]

    if (roles && roles.length > 0) {
      const roleFilter = inArray(ecoOrganizations.org_role, roles as any[]) as unknown as SQL
      if (roleFilter !== undefined) {
        conditions.push(roleFilter)
      }
    }

    if (verifiedOnly) {
      const verifiedFilter = and(
        sql`coalesce(${ecoOrganizations.metadata}::jsonb ->> 'is_partner', 'false') = 'true'`,
        sql`coalesce(${ecoOrganizations.metadata}::jsonb ->> 'verification_status', '') = 'VERIFIED'`
      ) as SQL
      conditions.push(verifiedFilter)
    }

    const whereClause = conditions.reduce<SQL | undefined>((acc, curr) => {
      if (!acc) return curr
      return and(acc, curr) as SQL
    }, undefined)

    const rows = await db
      .get()
      .select({
        eco_org_id: ecoOrganizations.id,
        organization_id: ecoOrganizations.organization_id,
        name: organizations.name,
        description: organizations.description,
        location: organizations.location,
        org_role: ecoOrganizations.org_role,
        contact_email: organizations.contact_email,
        verification_status: ecoOrganizations.verification_status,
        waste_types_handled: ecoOrganizations.waste_types_handled,
        service_areas: ecoOrganizations.service_areas,
        primary_interest: organizations.primary_interest,
        organization_type: organizations.type,
      })
      .from(ecoOrganizations)
      .innerJoin(organizations, eq(ecoOrganizations.organization_id, organizations.id))
      .where((whereClause ?? conditions[0]) as SQL)
      .orderBy(organizations.name)
      .limit(limit ?? 100)

    console.log(`[fetchPartners] Returned ${rows.length} partners`)
    if (rows.length === 0) {
      console.warn("[fetchPartners] No partners found - check eco_organizations table has entries")
    }

    // Normalize city from location
    return rows.map((row) => {
      const location = row.location || ""
      // Simple heuristic: take first part before comma as city
      const city = location.split(",")[0].trim() || null
      return {
        ...row,
        city,
      }
    })
  } catch (error) {
    console.error("[fetchPartners] Failed:", error)
    return []
  }
}

export async function fetchPartnerById(ecoOrganizationId: string): Promise<PartnerDetail | null> {
  noStore()

  if (!ecoOrganizationId || typeof ecoOrganizationId !== "string") {
    return null
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    ecoOrganizationId
  )
  if (!isUuid) {
    return null
  }

  try {
    const row = await db
      .get()
      .select({
        eco_org_id: ecoOrganizations.id,
        organization_id: ecoOrganizations.organization_id,
        name: organizations.name,
        description: organizations.description,
        location: organizations.location,
        org_role: ecoOrganizations.org_role,
        contact_email: organizations.contact_email,
        contact_phone: organizations.contact_phone, // Added: normalized field
        website: organizations.contact_website, // Added: normalized field (renamed for PartnerDetail)
        contact_person: organizations.contact_person,
        primary_interest: organizations.primary_interest,
        organization_type: organizations.type,
        verification_status: ecoOrganizations.verification_status,
        waste_types_handled: ecoOrganizations.waste_types_handled,
        service_areas: ecoOrganizations.service_areas,
        metadata: ecoOrganizations.metadata, // Deprecated: for backward compatibility
      })
      .from(ecoOrganizations)
      .innerJoin(organizations, eq(ecoOrganizations.organization_id, organizations.id))
      .where(eq(ecoOrganizations.id, ecoOrganizationId))
      .limit(1)

    if (!row || !row[0]) {
      console.warn(`[fetchPartnerById] Partner not found for ID: ${ecoOrganizationId}`)
      return null
    }

    const partner = row[0]
    const location = partner.location || ""
    const city = location.split(",")[0].trim() || null

    // Return normalized contact fields directly (no metadata parsing needed)
    return {
      ...partner,
      city,
    } as PartnerDetail
  } catch (error) {
    console.error("[fetchPartnerById] Failed:", error)
    return null
  }
}
