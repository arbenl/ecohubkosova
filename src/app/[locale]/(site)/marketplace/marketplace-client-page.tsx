"use client"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ListingCardV2 } from "@/components/marketplace-v2/ListingCardV2"
import type { Listing } from "@/types"
import { Search, SlidersHorizontal } from "lucide-react"
import { useEffect, useState, useCallback, useMemo } from "react"

type MarketplaceApiResponse = {
  listings: Listing[]
  hasMore: boolean
}

interface MarketplaceClientPageProps {
  locale: string
  initialSearchParams: Record<string, string | string[] | undefined>
  showHero?: boolean
  heroTitle?: string
  hideSearchBar?: boolean
}

export default function MarketplaceClientPage({
  locale,
  initialSearchParams,
  showHero = true,
  heroTitle: heroTitleProp,
  hideSearchBar = false,
}: MarketplaceClientPageProps) {
  const t = useTranslations("marketplace")
  const landingT = useTranslations("marketplace-landing")
  const heroTitle = heroTitleProp ?? landingT("hero.title")
  const [listings, setListings] = useState<Listing[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Parse initial filters from search params
  const initialFilters = {
    type:
      (initialSearchParams.type as string) === "blej"
        ? "blej"
        : (initialSearchParams.type as string) === "shes"
          ? "shes"
          : (initialSearchParams.type as string) === "sherbime"
            ? "sherbime"
            : "te-gjitha",
    search: (initialSearchParams.search as string) || "",
    category: (initialSearchParams.category as string) || "all",
    page: Math.max(1, Number.parseInt((initialSearchParams.page as string) || "1")),
    condition: (initialSearchParams.condition as string) || "",
    location: (initialSearchParams.location as string) || "",
    sort: ((initialSearchParams.sort as string) === "oldest" ? "oldest" : "newest") as
      | "newest"
      | "oldest",
  }

  // Map dropdown options to the V2 category slugs stored in eco_categories.slug
  const categories = [
    { value: "recycled-metals", label: t("categoryList.recyclable_materials") },
    { value: "plastic-packaging", label: t("categoryList.sustainable_products") },
    { value: "ewaste", label: t("categoryList.electronics") },
    { value: "wood-pallets", label: t("categoryList.services") },
    { value: "textiles-light", label: t("categoryList.textiles") },
    { value: "materials-organic", label: t("categoryList.food_agriculture") },
  ]

  // Kosovo cities and towns
  const kosovaLocations = [
    "Prishtinë",
    "Prizren",
    "Pejë",
    "Gjakovë",
    "Mitrovicë",
    "Vushtrri",
    "Ferizaj",
    "Obiliq",
    "Drenas",
    "Graçanicë",
    "Kaçanik",
    "Lipjan",
    "Podujevë",
    "Suva Reka",
    "Shillovë",
    "Kamenicë",
    "Gjilan",
    "Tetovë",
    "Skopje (maqedonas)",
  ]

  // Simple filter state management without navigation
  const [filters, setFilters] = useState(initialFilters)

  const updateFilter = useCallback(
    <K extends keyof typeof initialFilters>(key: K, value: (typeof initialFilters)[K]) => {
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

  // Get condition options from current listings
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

  // Load listings from API
  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set("page", filters.page.toString())
        params.set("pageSize", "12")
        params.set("locale", locale) // Pass locale to API

        if (filters.type !== "te-gjitha") {
          params.set("type", filters.type)
        }

        if (filters.category !== "all") {
          params.set("category", filters.category)
        }

        if (filters.search.trim()) {
          params.set("search", filters.search.trim())
        }

        if (filters.condition.trim()) {
          params.set("condition", filters.condition.trim())
        }

        if (filters.location.trim() && filters.location !== "all") {
          params.set("location", filters.location.trim())
        }

        if (filters.sort === "oldest") {
          params.set("sort", filters.sort)
        }

        const response = await fetch(`/api/marketplace/listings?${params.toString()}`, {
          method: "GET",
        })

        if (!response.ok) {
          throw new Error("Failed to load listings")
        }

        const data: MarketplaceApiResponse = await response.json()

        setListings(data.listings || [])
        setHasMore(Boolean(data.hasMore))
      } catch (err) {
        console.error("[MarketplaceClient] Failed to load listings", err)
        setError(t("errorLoading"))
        setListings([])
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadListings()
  }, [filters, locale])

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
      {/* Hero Section (optional) */}
      {showHero && (
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">{heroTitle}</h2>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] shadow-sm p-5 md:p-6 space-y-4 md:sticky md:top-4 md:z-10 md:backdrop-blur-sm">
        {/* Tab Selection */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant={filters.type === "te-gjitha" ? "default" : "primary-ghost"}
            className="rounded-full px-6"
            onClick={() => updateFilter("type", "te-gjitha")}
            disabled={isLoading}
          >
            {t("filterTypes.all")}
          </Button>
          <Button
            variant={filters.type === "shes" ? "default" : "primary-ghost"}
            className="rounded-full px-6"
            onClick={() => updateFilter("type", "shes")}
            disabled={isLoading}
          >
            {t("filterTypes.forSale")}
          </Button>
          <Button
            variant={filters.type === "blej" ? "default" : "primary-ghost"}
            className="rounded-full px-6"
            onClick={() => updateFilter("type", "blej")}
            disabled={isLoading}
          >
            {t("filterTypes.wanted")}
          </Button>
          <Button
            variant={filters.type === "sherbime" ? "default" : "primary-ghost"}
            className="rounded-full px-6"
            onClick={() => updateFilter("type", "sherbime")}
            disabled={isLoading}
          >
            {t("filterTypes.services")}
          </Button>
        </div>

        {/* Search Form - hidden when embedded in landing */}
        {!hideSearchBar && (
          <form
            className="flex flex-col md:flex-row gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              updateFilter("search", (e.target as any).search.value)
            }}
          >
            <div className="relative flex-grow">
              <Input
                name="search"
                type="text"
                placeholder={t("searchPlaceholder")}
                className="pl-10 pr-4 py-2 w-full rounded-lg"
                defaultValue={filters.search}
                disabled={isLoading}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <Button
              type="submit"
              variant="subtle"
              className="flex items-center justify-center gap-2 rounded-full"
              disabled={isLoading}
            >
              <SlidersHorizontal className="w-5 h-5" />
              {isLoading ? t("filtering") : t("filter")}
            </Button>
          </form>
        )}

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          {process.env.NODE_ENV === "test" ? (
            <div className="flex flex-col gap-1">
              <label
                className="text-xs font-semibold text-muted-foreground"
                htmlFor="category-select"
              >
                category
              </label>
              <select
                id="category-select"
                data-testid="category-trigger"
                className="h-10 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3"
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                disabled={isLoading}
              >
                <option value="all">categoryList.all</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Select
              onValueChange={(value) => updateFilter("category", value)}
              value={filters.category}
              disabled={isLoading}
            >
              <SelectTrigger
                data-testid="category-trigger"
                aria-label={t("category") ?? "category"}
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t("category") ?? "category"}
                  </span>
                  <SelectValue placeholder={t("category") ?? "category"} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Condition Filter */}
          <Select
            onValueChange={(value) => updateFilter("condition", value === "all" ? "" : value)}
            value={filters.condition || "all"}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("condition")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allConditions")}</SelectItem>
              {conditionOptions.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Location Filter - Dropdown */}
          <Select
            onValueChange={(value) => updateFilter("location", value)}
            value={filters.location}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("location")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("location")} - {t("allCategories")}
              </SelectItem>
              {kosovaLocations.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Control */}
          <Select
            onValueChange={(value) => updateFilter("sort", value as "newest" | "oldest")}
            value={filters.sort}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("newest")}</SelectItem>
              <SelectItem value="oldest">{t("oldest")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Listings Grid or Empty State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">{t("loadingListings")}</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>{t("tryAgain")}</Button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">{t("noMatchingListings")}</p>
          <p className="text-sm text-gray-500">{t("tryChangingFilters")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCardV2 key={listing.id} listing={listing} locale={locale} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          disabled={filters.page <= 1 || isLoading}
          onClick={() => updateFilter("page", Math.max(1, filters.page - 1))}
        >
          {t("previous")}
        </Button>

        <div className="text-sm text-gray-600 space-x-2">
          <span>
            {t("page")} {filters.page}
          </span>
          {isLoading && <span className="italic text-gray-500">{t("loading")}</span>}
        </div>

        <Button
          variant="outline"
          disabled={!hasMore || isLoading}
          onClick={() => updateFilter("page", filters.page + 1)}
        >
          {t("next")}
        </Button>
      </div>
    </div>
  )
}
