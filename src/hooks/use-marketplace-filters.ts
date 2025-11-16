"use client"

import { useCallback, useEffect, useMemo, useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import type { Listing } from "@/types"

const DEFAULT_PAGE = 1

type SortOrder = "newest" | "oldest"

interface MarketplaceFilterArgs {
  initialTab: string
  initialSearchQuery: string
  initialSelectedCategory: string
  initialCondition: string
  initialLocation: string
  initialSortOrder: SortOrder
  initialPage: number
  listings: Listing[]
}

type QueryOverrides = Partial<{
  tab: string
  category: string
  search: string
  page: number
  condition: string
  location: string
  sort: SortOrder
}>

export function useMarketplaceFilters({
  initialTab,
  initialSearchQuery,
  initialSelectedCategory,
  initialCondition,
  initialLocation,
  initialSortOrder,
  initialPage,
  listings,
}: MarketplaceFilterArgs) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialSelectedCategory)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder)
  const [conditionFilter, setConditionFilter] = useState(initialCondition)
  const [locationFilter, setLocationFilter] = useState(initialLocation)
  const [page, setPage] = useState(initialPage)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSearchQuery(initialSearchQuery)
  }, [initialSearchQuery])

  useEffect(() => {
    setSelectedCategory(initialSelectedCategory)
  }, [initialSelectedCategory])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    setConditionFilter(initialCondition)
  }, [initialCondition])

  useEffect(() => {
    setLocationFilter(initialLocation)
  }, [initialLocation])

  useEffect(() => {
    setSortOrder(initialSortOrder)
  }, [initialSortOrder])

  useEffect(() => {
    setPage(initialPage)
  }, [initialPage])

  const buildQuery = useCallback(
    ({
      tab,
      category,
      search,
      page,
      condition,
      location,
      sort,
    }: {
      tab: string
      category: string
      search: string
      page: number
      condition: string
      location: string
      sort: SortOrder
    }) => {
      const params = new URLSearchParams()

      if (tab !== "te-gjitha") {
        params.set("lloji", tab)
      }

      if (category !== "all") {
        params.set("category", category)
      }

      if (search.trim()) {
        params.set("search", search.trim())
      }

      if (page > 1) {
        params.set("page", String(page))
      }

      if (condition.trim()) {
        params.set("condition", condition.trim())
      }

      if (location.trim()) {
        params.set("location", location.trim())
      }

      if (sort === "oldest") {
        params.set("sort", sort)
      }

      return params.toString()
    },
    []
  )

  const pushQuery = useCallback(
    (overrides?: QueryOverrides) => {
      const query = buildQuery({
        tab: overrides?.tab ?? activeTab,
        category: overrides?.category ?? selectedCategory,
        search: overrides?.search ?? searchQuery,
        page: overrides?.page ?? DEFAULT_PAGE,
        condition: overrides?.condition ?? conditionFilter,
        location: overrides?.location ?? locationFilter,
        sort: overrides?.sort ?? sortOrder,
      })

      startTransition(() => {
        router.push(query ? `?${query}` : "?")
      })
    },
    [
      activeTab,
      buildQuery,
      conditionFilter,
      locationFilter,
      router,
      searchQuery,
      selectedCategory,
      sortOrder,
    ]
  )

  const handleSearchSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      setPage(DEFAULT_PAGE)
      pushQuery({ page: DEFAULT_PAGE, search: searchQuery })
    },
    [pushQuery, searchQuery]
  )

  const handleCategoryChange = useCallback(
    (value: string) => {
      setSelectedCategory(value)
      setPage(DEFAULT_PAGE)
      pushQuery({ page: DEFAULT_PAGE, category: value })
    },
    [pushQuery]
  )

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab)
      setPage(DEFAULT_PAGE)
      pushQuery({ page: DEFAULT_PAGE, tab })
    },
    [pushQuery]
  )

  const handleConditionChange = useCallback(
    (value: string) => {
      const normalized = value === "all" ? "" : value
      setConditionFilter(normalized)
      setPage(DEFAULT_PAGE)
      pushQuery({ page: DEFAULT_PAGE, condition: normalized })
    },
    [pushQuery]
  )

  const handleLocationInputChange = useCallback((value: string) => {
    setLocationFilter(value)
  }, [])

  const applyLocationFilter = useCallback(() => {
    setPage(DEFAULT_PAGE)
    pushQuery({ page: DEFAULT_PAGE, location: locationFilter })
  }, [locationFilter, pushQuery])

  const handleSortChange = useCallback(
    (value: SortOrder) => {
      setSortOrder(value)
      setPage(DEFAULT_PAGE)
      pushQuery({ page: DEFAULT_PAGE, sort: value })
    },
    [pushQuery]
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      pushQuery({ page: newPage })
    },
    [pushQuery]
  )

  const conditionOptions = useMemo(() => {
    const values = new Set<string>()
    listings.forEach((listing) => {
      if (listing.gjendja) {
        values.add(listing.gjendja)
      }
    })

    if (conditionFilter) {
      values.add(conditionFilter)
    }

    return Array.from(values)
  }, [conditionFilter, listings])

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    activeTab,
    sortOrder,
    conditionFilter,
    locationFilter,
    isPending,
    page,
    conditionOptions,
    handleSearchSubmit,
    handleCategoryChange,
    handleTabChange,
    handleConditionChange,
    handleLocationInputChange,
    applyLocationFilter,
    handleSortChange,
    handlePageChange,
  }
}
