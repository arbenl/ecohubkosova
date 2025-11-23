"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Leaf } from "lucide-react"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"

// Type for the listing data from API
// We use a flexible type here to support both V1 and V2 listing shapes during migration
interface ListingCardV2Props {
  listing: {
    id: string
    title: string
    description: string | null
    // V2 specific fields (optional for V1 compatibility)
    flow_type?: string
    pricing_type?: string
    city?: string | null
    eco_labels?: string[] | null
    tags?: string[] | null
    category_name_en?: string | null
    category_name_sq?: string | null

    // V1 fields that map to V2 concepts
    price?: string | number | null
    currency?: string | null
    location?: string | null // Maps to city
    listing_type?: string // Maps to flow_type

    // Common fields
    slug?: string | null
    images?: string[] | null
    status?: string
    visibility?: string
    created_at?: string
    updated_at?: string | null
    user_id?: string
    organization_id?: string | null
    category_id?: string | null
    quantity?: string | null
    unit?: string | null
    condition?: string | null
    category?: string // V1 field
  }
  locale: string
}

// Map flow types to colors (keeping colors as they are UI-related, not content)
const FLOW_TYPE_COLORS: Record<string, string> = {
  OFFER_WASTE: "bg-orange-100 text-orange-700 border-orange-200",
  OFFER_MATERIAL: "bg-blue-100 text-blue-700 border-blue-200",
  OFFER_RECYCLED_PRODUCT: "bg-green-100 text-green-700 border-green-200",
  REQUEST_MATERIAL: "bg-purple-100 text-purple-700 border-purple-200",
  SERVICE_REPAIR: "bg-teal-100 text-teal-700 border-teal-200",
  SERVICE_REFURBISH: "bg-teal-100 text-teal-700 border-teal-200",
  SERVICE_COLLECTION: "bg-teal-100 text-teal-700 border-teal-200",
  SERVICE_CONSULTING: "bg-teal-100 text-teal-700 border-teal-200",
  SERVICE_OTHER: "bg-teal-100 text-teal-700 border-teal-200",
}

export function ListingCardV2({ listing, locale }: ListingCardV2Props) {
  const t = useTranslations("marketplace-v2")

  // Normalize data (V1 -> V2 mapping)
  const flowType =
    listing.flow_type || (listing.listing_type === "shes" ? "OFFER_MATERIAL" : "REQUEST_MATERIAL")
  const pricingType = listing.pricing_type || "NEGOTIABLE"
  const city = listing.city || listing.location
  const price = typeof listing.price === "number" ? listing.price.toString() : listing.price

  // Get flow type label with proper fallback (next-intl doesn't support fallback option)
  const flowTypeLabel = t(`flowTypes.${flowType}` as any) || flowType
  const flowTypeColor = FLOW_TYPE_COLORS[flowType] || "bg-gray-100 text-gray-700 border-gray-200"

  const categoryName =
    locale === "sq"
      ? listing.category_name_sq || listing.category_name_en || listing.category || ""
      : listing.category_name_en || listing.category || ""

  return (
    <Link
      href={`/${locale}/marketplace/${listing.id}`}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 rounded-lg"
      aria-label={listing.title}
    >
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:border-green-300 border-2">
        <CardHeader className="pb-3">
          {/* Flow Type Badge */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={`${flowTypeColor} font-medium text-xs`}>
              {flowTypeLabel}
            </Badge>
            {categoryName && <span className="text-xs text-muted-foreground">{categoryName}</span>}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-green-700 transition-colors">
            {listing.title}
          </h3>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Description */}
          {listing.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
          )}

          {/* Price */}
          {price && (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-green-600">
                {parseFloat(price).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">{listing.currency || "€"}</span>
              {pricingType !== "FIXED" && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({pricingType.toLowerCase()})
                </span>
              )}
            </div>
          )}

          {pricingType === "FREE" && (
            <div className="text-2xl font-bold text-green-600">
              {locale === "sq" ? "Falas" : "Free"}
            </div>
          )}

          {/* Location */}
          {city && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{city}</span>
            </div>
          )}

          {/* Eco Labels */}
          {listing.eco_labels && listing.eco_labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t">
              {listing.eco_labels.slice(0, 3).map((label) => {
                const displayLabel = t(`ecoLabels.${label.toLowerCase()}`)

                return (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="bg-green-50 text-green-700 border-green-200 text-xs gap-1"
                  >
                    <Leaf className="h-3 w-3" />
                    {displayLabel}
                  </Badge>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export function ListingCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden border-2">
      <CardHeader className="pb-3">
        {/* Flow Type Badge Skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Title Skeleton */}
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Price Skeleton */}
        <Skeleton className="h-6 w-20" />

        {/* Location Skeleton */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Eco Labels Skeleton */}
        <div className="flex gap-1.5 pt-2 border-t">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardContent>
    </Card>
  )
}
