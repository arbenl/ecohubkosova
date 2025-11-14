import { unstable_noStore as noStore } from "next/cache"
import { and, eq } from "drizzle-orm"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { db } from "@/lib/drizzle"
import { marketplaceListings, organizationMembers } from "@/db/schema"
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
  const supabase = createServerSupabaseClient()

  try {
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = page * ITEMS_PER_PAGE - 1

    let query = supabase
      .from("tregu_listime")
      .select(
        `
        *,
        users!inner(emri_i_plote),
        organizations!inner(emri)
      `
      )
      .eq("eshte_aprovuar", true)
      .order("created_at", { ascending: sort === "oldest" })
      .range(from, to)

    if (type !== "te-gjitha") {
      query = query.eq("lloji_listimit", type)
    }

    if (search) {
      query = query.ilike("titulli", `%${search}%`)
    }

    if (category !== "all") {
      query = query.eq("kategori", category)
    }

    if (condition.trim()) {
      query = query.eq("gjendja", condition.trim())
    }

    if (location.trim()) {
      query = query.ilike("vendndodhja", `%${location.trim()}%`)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const list = (data ?? []) as Listing[]
    return {
      data: list,
      hasMore: list.length === ITEMS_PER_PAGE,
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
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("tregu_listime")
      .select(
        `
        *,
        users!inner(emri_i_plote, email),
        organizations (emri, email_kontakti)
      `
      )
      .eq("id", id)
      .eq("eshte_aprovuar", true)
      .single()

    if (error) {
      throw error
    }

    return { data: data as Listing, error: null as string | null }
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
  const [membership] = await db
    .get()
    .select({ organization_id: organizationMembers.organization_id })
    .from(organizationMembers)
    .where(and(eq(organizationMembers.user_id, userId), eq(organizationMembers.eshte_aprovuar, true)))
    .limit(1)

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
    const [updated] = await db
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
    const [deleted] = await db
      .get()
      .delete(marketplaceListings)
      .where(and(eq(marketplaceListings.id, listingId), eq(marketplaceListings.created_by_user_id, userId)))
      .returning({ id: marketplaceListings.id })

    if (!deleted) {
      return { error: "Listimi nuk u gjet ose nuk keni të drejta ta fshini." }
    }

    return { success: true }
  } catch (error) {
    console.error("[services/listings] Failed to delete listing:", error)
    return { error: "Gabim gjatë fshirjes së listimit. Ju lutemi provoni përsëri." }
  }
}
