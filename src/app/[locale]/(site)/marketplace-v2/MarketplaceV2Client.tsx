"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ListingCardV2, ListingCardSkeleton } from "@/components/marketplace-v2/ListingCardV2"
import { EmptyState } from "@/components/marketplace-v2/EmptyState"
import { FiltersV2 } from "@/components/marketplace-v2/FiltersV2"
import { PaginationV2 } from "@/components/marketplace-v2/PaginationV2"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import type { Listing, MarketplaceListingsResponse } from "./types"

interface MarketplaceV2ClientProps {
  locale: string
  user?: unknown
}

const DEFAULT_LIMIT = 12

const parsePageParam = (value: string | null): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return 1
  return Math.floor(parsed)
}

const parseLimitParam = (value: string | null): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT
  return Math.min(Math.floor(parsed), 100)
}

export default function MarketplaceV2Client({ locale, user }: MarketplaceV2ClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 1,
    totalCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const requestedPage = useMemo(() => parsePageParam(searchParams.get("page")), [searchParams])
  const requestedLimit = useMemo(() => parseLimitParam(searchParams.get("limit")), [searchParams])

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    async function fetchListings() {
      try {
        setLoading(true)
        setError(null)

        // Build query string from search params
        const params = new URLSearchParams()

        const q = searchParams.get("q")
        const flowType = searchParams.get("flowType")

        if (q) params.set("q", q)
        if (flowType) params.set("flowType", flowType)
        params.set("page", requestedPage.toString())
        params.set("limit", requestedLimit.toString())

        const url = `/api/marketplace-v2/listings?${params.toString()}`

        const response = await fetch(url, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data: MarketplaceListingsResponse = await response.json()

        if (data.success) {
          const derivedTotalPages =
            typeof data.totalPages === "number"
              ? data.totalPages
              : data.totalCount === 0
                ? 0
                : Math.ceil(data.totalCount / data.limit)

          setListings(data.listings || [])
          setPagination({
            page: data.page || 1,
            limit: data.limit || DEFAULT_LIMIT,
            totalPages: derivedTotalPages,
            totalCount: data.totalCount || 0,
          })

          // Normalize URL if API adjusted page/limit (e.g., clamped to last page)
          const currentPageParam = searchParams.get("page") || "1"
          const currentLimitParam = searchParams.get("limit") || `${DEFAULT_LIMIT}`
          if (
            data.page?.toString() !== currentPageParam ||
            data.limit?.toString() !== currentLimitParam
          ) {
            const normalizedParams = new URLSearchParams(searchParams.toString())
            normalizedParams.set("page", data.page.toString())
            normalizedParams.set("limit", data.limit.toString())
            router.replace(`?${normalizedParams.toString()}`, { scroll: false })
          }
        } else {
          throw new Error(data.error || data.message || "Failed to fetch listings")
        }
      } catch (err) {
        clearTimeout(timeoutId)
        if ((err as Error).name === "AbortError") return
        console.error("[MarketplaceV2Client] Error fetching listings:", err)
        setError(locale === "sq" ? "Gabim në ngarkimin e ofertave" : "Error loading listings")
      } finally {
        setLoading(false)
      }
    }

    fetchListings()

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [searchParams, locale, router, requestedPage, requestedLimit])

  const handlePageChange = (page: number) => {
    const nextPage = Math.max(1, page)
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", nextPage.toString())
    params.set("limit", pagination.limit.toString())

    router.push(`?${params.toString()}`, { scroll: true })
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <FiltersV2 locale={locale} />

        {/* Results count skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <FiltersV2 locale={locale} />
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Empty state (no filters applied)
  const hasFilters = searchParams.get("q") || searchParams.get("flowType")
  if (listings.length === 0 && !hasFilters && pagination.page === 1) {
    return <EmptyState locale={locale} user={user} />
  }

  // Content with filters
  return (
    <div className="space-y-8">
      {/* Filters */}
      <FiltersV2 locale={locale} />

      {/* No results with filters */}
      {listings.length === 0 && hasFilters && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {locale === "sq"
              ? "Asnjë ofertë nuk përputhet me filtrat tuaj"
              : "No listings match your filters"}
          </p>
        </div>
      )}

      {/* Results */}
      {listings.length > 0 && (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {locale === "sq" ? (
                <>
                  {pagination.totalCount} {pagination.totalCount === 1 ? "ofertë" : "oferta"} të
                  gjetura
                </>
              ) : (
                <>
                  {pagination.totalCount} {pagination.totalCount === 1 ? "listing" : "listings"}{" "}
                  found
                </>
              )}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCardV2 key={listing.id} listing={listing} locale={locale} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <PaginationV2
              page={pagination.page}
              limit={pagination.limit}
              totalCount={pagination.totalCount}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  )
}
