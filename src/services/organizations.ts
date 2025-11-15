import { unstable_noStore as noStore } from "next/cache"
import { and, desc, eq, ilike, or } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { organizations } from "@/db/schema"
import type { Organization } from "@/types"

const ITEMS_PER_PAGE = 9

export interface OrganizationListOptions {
  search?: string
  type?: string
  interest?: string
  page?: number
}

export interface PaginatedResult<T> {
  data: T[]
  hasMore: boolean
  error: string | null
}

export async function fetchOrganizationsList({
  search = "",
  type = "all",
  interest = "all",
  page = 1,
}: OrganizationListOptions): Promise<PaginatedResult<Organization>> {
  noStore()

  try {
    const offset = (page - 1) * ITEMS_PER_PAGE
    const filters = [eq(organizations.eshte_aprovuar, true)]

    if (search.trim()) {
      const term = `%${search.trim()}%`
      const nameOrDescription = or(ilike(organizations.emri, term), ilike(organizations.pershkrimi, term))
      if (nameOrDescription) {
        filters.push(nameOrDescription)
      }
    }

    if (type !== "all") {
      filters.push(eq(organizations.lloji, type))
    }

    if (interest !== "all") {
      filters.push(ilike(organizations.interesi_primar, `%${interest}%`))
    }

    const whereClause = filters.length === 1 ? filters[0] : and(...filters)
    const rows = await db
      .get()
      .select()
      .from(organizations)
      .where(whereClause)
      .orderBy(desc(organizations.created_at))
      .limit(ITEMS_PER_PAGE + 1)
      .offset(offset)

    const hasMore = rows.length > ITEMS_PER_PAGE
    const list = rows.slice(0, ITEMS_PER_PAGE).map(toOrganization)
    return {
      data: list,
      hasMore,
      error: null,
    }
  } catch (error) {
    console.error("fetchOrganizationsList error:", error)
    return {
      data: [],
      hasMore: false,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të organizatave.",
    }
  }
}

export async function fetchOrganizationById(id: string) {
  noStore()

  try {
    const rows = await db
      .get()
      .select()
      .from(organizations)
      .where(and(eq(organizations.id, id), eq(organizations.eshte_aprovuar, true)))
      .limit(1)
    const row = rows[0]

    if (!row) {
      throw new Error("Organizata nuk u gjet ose nuk është e aprovuar.")
    }

    return { data: toOrganization(row), error: null as string | null }
  } catch (error) {
    console.error("fetchOrganizationById error:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të organizatës.",
    }
  }
}

function toOrganization(record: typeof organizations.$inferSelect): Organization {
  return {
    ...record,
    created_at: record.created_at.toISOString(),
    updated_at: record.updated_at ? record.updated_at.toISOString() : null,
  }
}
