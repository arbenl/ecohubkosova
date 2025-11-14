import { and, eq, ilike } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { organizations } from "@/db/schema"

export type PublicOrganization = {
  id: string
  emri: string
  pershkrimi: string
  interesi_primar: string
  person_kontakti: string
  email_kontakti: string
  vendndodhja: string
  lloji: string
  created_at: string
  updated_at: string | null
}

export type PublicOrganizationFilters = {
  lloji?: string
  search?: string
}

export async function fetchPublicOrganizations(filters: PublicOrganizationFilters = {}) {
  try {
    const conditions = [eq(organizations.eshte_aprovuar, true)]

    if (filters.lloji) {
      conditions.push(eq(organizations.lloji, filters.lloji))
    }

    if (filters.search) {
      const term = `%${filters.search}%`
      conditions.push(ilike(organizations.emri, term))
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
