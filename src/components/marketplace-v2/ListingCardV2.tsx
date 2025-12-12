"use client"

import { Link, useRouter } from "@/i18n/routing"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Leaf } from "lucide-react"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"

// Flexible listing shape that works for both V1 and V2 data during migration
interface ListingCardV2Props {
  listing: {
    id: string
    title: string
    description: string | null
    flow_type?: string | null
    pricing_type?: string | null
    city?: string | null
    region?: string | null
    eco_labels?: string[] | null
    tags?: string[] | null
    category_name_en?: string | null
    category_name_sq?: string | null
    price?: string | number | null
    currency?: string | null
    location?: string | null // Maps to city
    listing_type?: string // Maps to flow_type
    slug?: string | null
    images?: string[] | null
    status?: string | null
    visibility?: string | null
    created_at?: string
    updated_at?: string | null
    user_id?: string
    organization_id?: string | null
    category_id?: string | null
    quantity?: string | null
    unit?: string | null
    condition?: string | null
    category?: string
    contact?: string
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
  const router = useRouter()

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

  // Get filter type from flow type
  const getFilterType = (flowType: string) => {
    if (flowType.startsWith("OFFER_")) return "shes"
    if (flowType.startsWith("REQUEST_")) return "blej"
    if (flowType.startsWith("SERVICE_")) return "sherbime"
    return "te-gjitha"
  }

  return (
    <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:border-green-300 border-2 card-lift flex flex-col">
      {/* Flow Type & Category Badges - OUTSIDE Link for click handling */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              router.push(`/marketplace?type=${getFilterType(flowType)}`)
            }}
            className="inline-flex"
          >
            <Badge
              variant="outline"
              className={`${flowTypeColor} font-medium text-xs hover:opacity-80 transition-opacity cursor-pointer`}
            >
              {flowTypeLabel}
            </Badge>
          </button>
          {categoryName && (
            <button
              type="button"
              onClick={() => {
                router.push(
                  `/marketplace?category=${encodeURIComponent(categoryName.toLowerCase())}`
                )
              }}
              className="inline-flex"
            >
              <span className="text-xs text-muted-foreground hover:text-green-600 transition-colors cursor-pointer">
                {categoryName}
              </span>
            </button>
          )}
        </div>
      </div>

      <Link
        href={`/marketplace/${listing.id}`}
        className="block flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
        aria-label={listing.title}
      >
        <CardHeader className="pb-3 pt-0">
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
        </CardContent>
      </Link>

      {/* Location & Eco Labels - OUTSIDE Link for click handling */}
      {(city || (listing.eco_labels && listing.eco_labels.length > 0)) && (
        <div className="px-6 pb-4 pt-2 border-t mt-auto space-y-2">
          {/* Clickable Location */}
          {city && (
            <button
              type="button"
              onClick={() => {
                router.push(`/marketplace?location=${encodeURIComponent(city)}`)
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-600 transition-colors cursor-pointer"
            >
              <MapPin className="h-4 w-4" />
              <span>{city}</span>
            </button>
          )}

          {/* Eco Labels */}
          {listing.eco_labels && listing.eco_labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {listing.eco_labels.slice(0, 3).map((label) => {
                const displayLabel = t(`ecoLabels.${label.toLowerCase()}`)

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      router.push(`/marketplace?tag=${encodeURIComponent(label.toLowerCase())}`)
                    }}
                    className="inline-flex"
                  >
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700 border-green-200 text-xs gap-1 hover:bg-green-100 hover:border-green-300 transition-colors cursor-pointer"
                    >
                      <Leaf className="h-3 w-3" />
                      {displayLabel}
                    </Badge>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Card>
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
