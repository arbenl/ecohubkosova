"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ListingCard } from "@/components/listings/ListingCard"
import type { Listing } from "@/types"
import { Search, SlidersHorizontal } from "lucide-react"
import { useEffect, useState, useCallback, useMemo } from "react"

interface MarketplaceClientPageProps {
  locale: string
  initialSearchParams: Record<string, string | string[] | undefined>
}

const TAB_OPTIONS = [
  { value: "te-gjitha", label: "Të gjitha" },
  { value: "shes", label: "Për Shitje" },
  { value: "blej", label: "Kërkoj të Blej" },
]

export default function MarketplaceClientPage({
  locale,
  initialSearchParams,
}: MarketplaceClientPageProps) {
  const router = useRouter()
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

  const categories = [
    "Materiale të riciklueshme",
    "Produkte të qëndrueshme",
    "Shërbime",
    "Energji e ripërtëritshme",
    "Ushqim dhe bujqësi",
    "Tekstile",
    "Elektronikë",
    "Tjera",
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

        if (filters.location.trim()) {
          params.set("location", filters.location.trim())
        }

        if (filters.sort === "oldest") {
          params.set("sort", filters.sort)
        }

        const response = await fetch(`/api/marketplace/listings?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to load listings")
        }

        const data = await response.json()

        // Transform API response to match Listing type
        const transformedListings: Listing[] = data.listings.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          foto_url: null, // Not available in API response
          price: Number(item.price),
          currency: null, // Not available in API response
          category: item.category,
          condition: item.gjendja || "",
          // Add other fields as needed
        }))

        setListings(transformedListings)
        setHasMore(data.hasMore)
      } catch (err) {
        console.error("[MarketplaceClient] Failed to load listings", err)
        setError("Ka ndodhur një gabim gjatë ngarkimit të listimeve")
        setListings([])
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadListings()
  }, [filters])

  const handleContactClick = (listing: Listing) => {
    router.push(`/${locale}/marketplace/${listing.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Tab Selection */}
      <div className="flex flex-wrap gap-3 justify-center">
        {TAB_OPTIONS.map((tab) => (
          <Button
            key={tab.value}
            variant={filters.type === tab.value ? "default" : "outline"}
            className="rounded-full px-6"
            onClick={() => updateFilter("type", tab.value)}
            disabled={isLoading}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        {/* Search Form */}
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
              placeholder="Kërko sipas titullit ose përshkrimit..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              defaultValue={filters.search}
              disabled={isLoading}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <Button
            type="submit"
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
            disabled={isLoading}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {isLoading ? "Duke filtruar..." : "Filtro"}
          </Button>
        </form>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <Select
            onValueChange={(value) => updateFilter("category", value)}
            value={filters.category}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha kategoritë</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Condition Filter */}
          <Select
            onValueChange={(value) => updateFilter("condition", value === "all" ? "" : value)}
            value={filters.condition || "all"}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Gjendja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha gjendjet</SelectItem>
              {conditionOptions.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Location Filter */}
          <Input
            type="text"
            placeholder="Vendndodhja"
            value={filters.location}
            onChange={(e) => updateFilter("location", e.target.value)}
            onBlur={() => updateFilter("location", filters.location)}
            onKeyDown={(e) => e.key === "Enter" && updateFilter("location", filters.location)}
            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />

          {/* Sort Control */}
          <Select
            onValueChange={(value) => updateFilter("sort", value as "newest" | "oldest")}
            value={filters.sort}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rendit sipas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Më të rejat</SelectItem>
              <SelectItem value="oldest">Më të vjetrat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Listings Grid or Empty State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Duke ngarkuar listimet...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Provo përsëri</Button>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Nuk u gjetën shpallje që përputhen me kriteret.</p>
          <p className="text-sm text-gray-500">
            Provo të ndryshosh filtrat ose shto një listim të ri
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onContact={handleContactClick} />
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
          ← Më parë
        </Button>

        <div className="text-sm text-gray-600 space-x-2">
          <span>Faqja {filters.page}</span>
          {isLoading && <span className="italic text-gray-500">Duke u ngarkuar...</span>}
        </div>

        <Button
          variant="outline"
          disabled={!hasMore || isLoading}
          onClick={() => updateFilter("page", filters.page + 1)}
        >
          Më pas →
        </Button>
      </div>
    </div>
  )
}
