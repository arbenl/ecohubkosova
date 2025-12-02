import { ecoListings } from "@/db/schema"
import type { Listing } from "@/types"

export interface ListingListOptions {
  type?: string
  flowType?: string
  search?: string
  category?: string
  page?: number
  pageSize?: number
  condition?: string
  location?: string
  sort?: "newest" | "oldest"
  locale?: string
}

/**
 * Result type for listing queries.
 * Follows the pattern from profile-service: typed result with error handling.
 */
export interface ListingsQueryResult {
  data: Listing[]
  hasMore: boolean
  error: string | null
}

export type ListingRow = {
  listing: typeof ecoListings.$inferSelect
  category_name_en: string | null
  category_name_sq: string | null
  organization_name: string | null
  organization_email: string | null
  organization_phone: string | null // Added: normalized from organizations.contact_phone
  organization_website: string | null // Added: normalized from organizations.contact_website
  organization_contact_person?: string | null
  organization_metadata?: unknown // Deprecated: will be removed after migration
  owner_name: string | null
  owner_email: string | null
}

export type ListingMutationResult = { success: true } | { error: string }
