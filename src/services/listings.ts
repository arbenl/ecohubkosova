import { unstable_noStore as noStore } from "next/cache"
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { marketplaceListings, organizationMembers, organizations, users } from "@/db/schema"
import type { Listing } from "@/types"
import type { ListingCreateInput } from "@/validation/listings"

const ITEMS_PER_PAGE = 9

export interface ListingListOptions {
  type?: string
  search?: string
  category?: string
  page?: number
  condition?: string
  location?: string
  sort?: "newest" | "oldest"
}

type ListingRow = {
  listing: typeof marketplaceListings.$inferSelect
  owner_name: string | null
  owner_email: string | null
  organization_name: string | null
  organization_email: string | null
  condition: string | null
}

const formatListingRow = (row: ListingRow): Listing => ({
  id: row.listing.id,
  titulli: row.listing.titulli,
  pershkrimi: row.listing.pershkrimi,
  foto_url: null,
  cmimi: Number(row.listing.cmimi),
  monedha: null,
  kategori: row.listing.kategori,
  gjendja: row.condition ?? "",
  vendndodhja: row.listing.vendndodhja,
  kontakti: row.organization_email ?? row.owner_email ?? "",
  created_at: row.listing.created_at.toISOString(),
  user_id: row.listing.created_by_user_id,
  eshte_publikuar: row.listing.eshte_aprovuar,
  users: row.owner_name
    ? {
        emri_i_plote: row.owner_name,
        email: row.owner_email ?? undefined,
      }
    : undefined,
  organizations: row.organization_name
    ? {
        emri: row.organization_name,
        email_kontakti: row.organization_email ?? undefined,
      }
    : undefined,
  sasia: row.listing.sasia,
  njesia: row.listing.njesia,
  lloji_listimit: row.listing.lloji_listimit as "shes" | "blej",
})

export async function fetchListings({
  type = "te-gjitha",
  search = "",
  category = "all",
  page = 1,
  condition = "",
  location = "",
  sort = "newest",
}: ListingListOptions) {
  noStore()

  try {
    const offset = (page - 1) * ITEMS_PER_PAGE
    const filters = [eq(marketplaceListings.eshte_aprovuar, true)]

    if (type && type !== "te-gjitha") {
      filters.push(eq(marketplaceListings.lloji_listimit, type))
    }

    if (search.trim()) {
      filters.push(ilike(marketplaceListings.titulli, `%${search.trim()}%`))
    }

    if (category !== "all") {
      filters.push(eq(marketplaceListings.kategori, category))
    }

    if (condition.trim()) {
      filters.push(sql`"tregu_listime"."gjendja" = ${condition.trim()}`)
    }

    if (location.trim()) {
      filters.push(ilike(marketplaceListings.vendndodhja, `%${location.trim()}%`))
    }

    const whereClause = filters.length === 1 ? filters[0] : and(...filters)

    const rows = await db
      .get()
      .select({
        listing: marketplaceListings,
        owner_name: users.emri_i_plote,
        owner_email: users.email,
        organization_name: organizations.emri,
        organization_email: organizations.email_kontakti,
        condition: sql<string | null>`"tregu_listime"."gjendja"`,
      })
      .from(marketplaceListings)
      .leftJoin(users, eq(marketplaceListings.created_by_user_id, users.id))
      .leftJoin(organizations, eq(marketplaceListings.organization_id, organizations.id))
      .where(whereClause)
      .orderBy(sort === "oldest" ? asc(marketplaceListings.created_at) : desc(marketplaceListings.created_at))
      .limit(ITEMS_PER_PAGE + 1)
      .offset(offset)

    const hasMore = rows.length > ITEMS_PER_PAGE
    const list = rows.slice(0, ITEMS_PER_PAGE).map(formatListingRow)

    return {
      data: list,
      hasMore,
      error: null as string | null,
    }
  } catch (error) {
    console.error("fetchListings error:", error)
    return {
      data: [] as Listing[],
      hasMore: false,
      error: error instanceof Error ? error.message : "Gabim gjatë ngarkimit të listimeve.",
    }
  }
}

export async function fetchListingById(id: string) {
  noStore()

  try {
    const records = await db
      .get()
      .select({
        listing: marketplaceListings,
        owner_name: users.emri_i_plote,
        owner_email: users.email,
        organization_name: organizations.emri,
        organization_email: organizations.email_kontakti,
        condition: sql<string | null>`"tregu_listime"."gjendja"`,
      })
      .from(marketplaceListings)
      .leftJoin(users, eq(marketplaceListings.created_by_user_id, users.id))
      .leftJoin(organizations, eq(marketplaceListings.organization_id, organizations.id))
      .where(eq(marketplaceListings.id, id))
      .limit(1)
    const record = records[0]

    if (!record) {
      throw new Error("Listimi nuk u gjet ose nuk është i aprovuar.")
    }

    return { data: formatListingRow(record), error: null as string | null }
  } catch (error) {
    console.error("fetchListingById error:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Listimi nuk u gjet ose nuk është i aprovuar.",
    }
  }
}

type ListingMutationResult = { success: true } | { error: string }

const formatPrice = (value: ListingCreateInput["cmimi"]) => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value.toFixed(2)
  }
  return null
}

async function findApprovedOrganizationId(userId: string) {
  const memberships = await db
    .get()
    .select({ organization_id: organizationMembers.organization_id })
    .from(organizationMembers)
    .where(and(eq(organizationMembers.user_id, userId), eq(organizationMembers.eshte_aprovuar, true)))
    .limit(1)
  const membership = memberships[0]

  return membership?.organization_id ?? null
}

export async function createUserListing(userId: string, payload: ListingCreateInput): Promise<ListingMutationResult> {
  const price = formatPrice(payload.cmimi)
  if (price === null) {
    return { error: "Çmimi është i detyrueshëm dhe duhet të jetë numër pozitiv." }
  }

  try {
    const organizationId = await findApprovedOrganizationId(userId)
    const now = new Date()

    await db
      .get()
      .insert(marketplaceListings)
      .values({
        created_by_user_id: userId,
        organization_id: organizationId,
        titulli: payload.titulli,
        pershkrimi: payload.pershkrimi,
        kategori: payload.kategori,
        cmimi: price,
        njesia: payload.njesia,
        vendndodhja: payload.vendndodhja,
        sasia: payload.sasia,
        lloji_listimit: payload.lloji_listimit,
        eshte_aprovuar: false,
        created_at: now,
        updated_at: now,
      })

    return { success: true }
  } catch (error) {
    console.error("[services/listings] Failed to create listing:", error)
    return { error: "Gabim gjatë shtimit të listimit. Ju lutemi provoni përsëri." }
  }
}

export async function updateUserListing(
  listingId: string,
  userId: string,
  payload: ListingCreateInput
): Promise<ListingMutationResult> {
  const price = formatPrice(payload.cmimi)
  if (price === null) {
    return { error: "Çmimi është i detyrueshëm dhe duhet të jetë numër pozitiv." }
  }

  try {
    const updateResult = await db
      .get()
      .update(marketplaceListings)
      .set({
        titulli: payload.titulli,
        pershkrimi: payload.pershkrimi,
        kategori: payload.kategori,
        cmimi: price,
        njesia: payload.njesia,
        vendndodhja: payload.vendndodhja,
        sasia: payload.sasia,
        lloji_listimit: payload.lloji_listimit,
        eshte_aprovuar: false,
        updated_at: new Date(),
      })
      .where(and(eq(marketplaceListings.id, listingId), eq(marketplaceListings.created_by_user_id, userId)))
      .returning({ id: marketplaceListings.id })

    const updated = updateResult?.[0]

    if (!updated) {
      return { error: "Listimi nuk u gjet ose nuk keni të drejta ta ndryshoni." }
    }

    return { success: true }
  } catch (error) {
    console.error("[services/listings] Failed to update listing:", error)
    return { error: "Gabim gjatë përditësimit të listimit. Ju lutemi provoni përsëri." }
  }
}

export async function deleteUserListing(listingId: string, userId: string): Promise<ListingMutationResult> {
  try {
    const deleteResult = await db
      .get()
      .delete(marketplaceListings)
      .where(and(eq(marketplaceListings.id, listingId), eq(marketplaceListings.created_by_user_id, userId)))
      .returning({ id: marketplaceListings.id })

    const deleted = deleteResult?.[0]

    if (!deleted) {
      return { error: "Listimi nuk u gjet ose nuk keni të drejta ta fshini." }
    }

    return { success: true }
  } catch (error) {
    console.error("[services/listings] Failed to delete listing:", error)
    return { error: "Gabim gjatë fshirjes së listimit. Ju lutemi provoni përsëri." }
  }
}
