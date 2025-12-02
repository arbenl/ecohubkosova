"use client"

import { useCallback, useMemo, useState, useTransition, useEffect } from "react"
import { useRouter, usePathname } from "@/i18n/routing"
import type { Listing } from "@/types"

type SortOrder = "newest" | "oldest"

interface MarketplaceFilters {
  type: string
  search: string
  category: string
  page: number
  condition: string
  location: string
  sort: SortOrder
}

interface UseMarketplaceFiltersArgs {
  initialFilters: MarketplaceFilters
  listings: Listing[]
}

export function useMarketplaceFilters({ initialFilters, listings }: UseMarketplaceFiltersArgs) {
  const router = useRouter()
  const pathname = usePathname()
  const [filters, setFilters] = useState<MarketplaceFilters>(initialFilters)
  const [isPending, startTransition] = useTransition()

  const updateFilter = useCallback(
    <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value }

        // Reset page when changing filters (except page itself)
        if (key !== "page") {
          newFilters.page = 1
        }

        return newFilters
      })
    },
    []
  )

  // Handle navigation when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (filters.type !== "te-gjitha") {
      params.set("type", filters.type)
    }

    if (filters.category !== "all") {
      params.set("category", filters.category)
    }

    if (filters.search.trim()) {
      params.set("search", filters.search.trim())
    }

    if (filters.page > 1) {
      params.set("page", String(filters.page))
    }

    if (filters.condition.trim()) {
      params.set("condition", filters.condition.trim())
    }

    if (filters.location.trim()) {
      params.set("location", filters.location.trim())
    }

    if (filters.sort === "oldest") {
      params.set("sort", filters.sort)
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }, [filters, router, pathname])

  const conditionOptions = useMemo(() => {
    const values = new Set<string>()
    listings.forEach((listing) => {
      if (listing.condition) {
        values.add(listing.condition)
      }
    })

    if (filters.condition) {
      values.add(filters.condition)
    }

    return Array.from(values)
  }, [filters.condition, listings])

  return {
    filters,
    updateFilter,
    isPending,
    conditionOptions,
  }
}
