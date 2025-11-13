"use server"

import type { Listing } from "@/types"
import { fetchListings } from "@/src/services/listings"

interface GetListingsDataResult {
  initialListings: Listing[]
  hasMoreInitial: boolean
  error: string | null
}

export async function getListingsData(
  searchParams: Record<string, string | undefined>
): Promise<GetListingsDataResult> {
  const result = await fetchListings({
    type: searchParams.lloji,
    search: searchParams.search,
    category: searchParams.category,
    page: searchParams.page ? Number.parseInt(searchParams.page, 10) : undefined,
  })

  return {
    initialListings: result.data,
    hasMoreInitial: result.hasMore,
    error: result.error,
  }
}
