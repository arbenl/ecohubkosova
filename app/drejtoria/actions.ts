"use server"

import type { OrganizationListOptions } from "@/src/services/organizations"
import { fetchOrganizationsList } from "@/src/services/organizations"

interface GetOrganizationsDataResult {
  initialOrganizations: Awaited<ReturnType<typeof fetchOrganizationsList>>["data"]
  hasMoreInitial: boolean
  error: string | null
}

export async function getOrganizationsData(
  searchParams: Record<string, string | undefined>
): Promise<GetOrganizationsDataResult> {
  const options: OrganizationListOptions = {
    search: searchParams.search,
    type: searchParams.type,
    interest: searchParams.interest,
    page: searchParams.page ? Number.parseInt(searchParams.page, 10) : undefined,
  }

  const result = await fetchOrganizationsList(options)
  return {
    initialOrganizations: result.data,
    hasMoreInitial: result.hasMore,
    error: result.error,
  }
}
