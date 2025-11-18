import { and, eq, ilike } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { organizations } from "@/db/schema"

export type PublicOrganization = {
  id: string
  name: string
  description: string
  primary_interest: string
  contact_person: string
  contact_email: string
  location: string
  type: string
  created_at: string
  updated_at: string | null
}

export type PublicOrganizationFilters = {
  type?: string
  search?: string
}

export async function fetchPublicOrganizations(filters: PublicOrganizationFilters = {}) {
  try {
    const conditions = [eq(organizations.is_approved, true)]

    if (filters.type) {
      conditions.push(eq(organizations.type, filters.type))
    }

    if (filters.search) {
      const term = `%${filters.search}%`
      conditions.push(ilike(organizations.name, term))
    }

    const rows = await db
      .get()
      .select()
      .from(organizations)
      .where(and(...conditions))
      .orderBy(organizations.created_at)

    const data: PublicOrganization[] = rows.map((org) => ({
      ...org,
      created_at: org.created_at.toISOString(),
      updated_at: org.updated_at ? org.updated_at.toISOString() : null,
    }))

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
