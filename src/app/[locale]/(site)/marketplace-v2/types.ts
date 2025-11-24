// Marketplace V2 shared types

export interface ListingFilters {
    q?: string // Search query (title/description)
    flowType?: string // Flow type filter (e.g. "OFFER_MATERIAL", "SERVICE_REPAIR")
    page?: number // Pagination page (1-based)
    limit?: number // Items per page
}

export interface Listing {
    id: string
    title: string
    description: string | null
    flow_type: string
    price: string | null
    currency: string | null
    pricing_type: string
    city: string | null
    country?: string | null
    region?: string | null
    eco_labels: string[] | null
    tags: string[] | null
    category_name_en: string | null
    category_name_sq: string | null
    category_id: string | null
}

export interface ListingMedia {
    id: string
    url: string
    storage_path: string | null
    file_type: string
    mime_type: string | null
    file_size: number | null
    is_primary: boolean | null
    sort_order: number
    alt_text: string | null
    caption: string | null
}

export interface ListingDetail extends Listing {
    condition: string | null
    lifecycle_stage: string | null
    quantity: string | null
    unit: string | null
    eco_labels: string[] | null
    certifications: string[] | null
    organization_name: string | null
    organization_role: string | null
    contact_email: string | null
    created_at: string
    media: ListingMedia[]
    contactCount?: number
}

export interface MarketplaceListingsResponse {
    success: boolean
    listings: Listing[]
    count: number
    totalCount: number
    page: number
    limit: number
    totalPages: number
    error?: string
    message?: string
}

// Form types for create/edit listing
export interface ListingFormValues {
    // Basic info
    title: string
    description: string
    category_id: string
    flow_type: string
    condition?: string
    lifecycle_stage?: string

    // Quantity & units
    quantity?: string
    unit?: string

    // Pricing
    price?: string
    currency: string
    pricing_type: string

    // Location
    country: string
    city?: string
    region?: string
    location_details?: string

    // Eco features
    eco_labels: string[]
    eco_score?: string

    // Tags
    tags: string[]

    // Media
    media?: Array<{
        id: string
        url: string
        storage_path: string | null
        file_type: string
        mime_type: string | null
        is_primary: boolean
        sort_order: number
        alt_text?: string
        caption?: string
    }>
}
