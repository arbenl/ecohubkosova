"use server"

import type { Listing } from "@/types"
import { fetchListings } from "@/services/listings"

interface GetListingsDataResult {
  initialListings: Listing[]
  hasMoreInitial: boolean
  error: string | null
}

export async function getListingsData(
  searchParams: Record<string, string | undefined>
): Promise<GetListingsDataResult> {
  const pageValue = searchParams.page ? Number.parseInt(searchParams.page, 10) : undefined
  const sortParam = searchParams.sort === "oldest" ? "oldest" : "newest"

  const result = await fetchListings({
    type: searchParams.type,
    search: searchParams.search,
    category: searchParams.category,
    page: pageValue,
    condition: searchParams.condition,
    location: searchParams.location,
    sort: sortParam,
  })

  return {
    initialListings: result.data,
    hasMoreInitial: result.hasMore,
    error: result.error,
  }
}
