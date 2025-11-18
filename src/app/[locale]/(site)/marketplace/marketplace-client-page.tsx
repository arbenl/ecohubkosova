"use client"

import { type FormEvent, type KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ListingCard } from "@/components/listings/ListingCard"
import type { Listing } from "@/types"
import { Search, SlidersHorizontal } from "lucide-react"
import { useMarketplaceFilters } from "@/hooks/use-marketplace-filters"

interface MarketplaceClientPageProps {
  initialListings: Listing[]
  hasMore: boolean
  initialTab: string
  initialSearchQuery: string
  initialSelectedCategory: string
  initialPage: number
  initialCondition: string
  initialLocation: string
  initialSortOrder: "newest" | "oldest"
  categories: string[]
  error?: string | null
}

const TAB_OPTIONS = [
  { value: "te-gjitha", label: "Të gjitha" },
  { value: "shes", label: "Për Shitje" },
  { value: "blej", label: "Kërkoj të Blej" },
]

/**
 * Client component: Marketplace listing display with filters.
 * 
 * Responsibilities:
 * - Handle all client-side filtering and navigation
 * - Display listings in responsive grid
 * - Show clear loading, empty, and error states
 * - Integrate with use-marketplace-filters hook
 * - Navigate to detail page on "Kontakto" click
 */
export default function MarketplaceClientPage({
  initialListings,
  hasMore,
  initialTab,
  initialSearchQuery,
  initialSelectedCategory,
  initialPage,
  initialCondition,
  initialLocation,
  initialSortOrder,
  categories,
  error,
}: MarketplaceClientPageProps) {
  const {
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
  } = useMarketplaceFilters({
    initialTab,
    initialSearchQuery,
    initialSelectedCategory,
    initialPage,
    initialCondition,
    initialLocation,
    initialSortOrder,
    listings: initialListings,
  })

  const router = useRouter()

  const handleLocationKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      applyLocationFilter()
    }
  }

  const handleContactClick = (listing: Listing) => {
    router.push(`/marketplace/${listing.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Tab Selection */}
      <div className="flex flex-wrap gap-3 justify-center">
        {TAB_OPTIONS.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "outline"}
            className="rounded-full px-6"
            onClick={() => handleTabChange(tab.value)}
            disabled={isPending}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        {/* Search Form */}
        <form className="flex flex-col md:flex-row gap-4" onSubmit={handleSearchSubmit}>
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Kërko sipas titullit ose përshkrimit..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isPending}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <Button
            type="submit"
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
            disabled={isPending}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {isPending ? "Duke filtruar..." : "Filtro"}
          </Button>
        </form>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={isPending}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Kategoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha kategoritë</SelectItem>
              {categories.filter(Boolean).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Condition Filter */}
          <Select onValueChange={handleConditionChange} value={conditionFilter || "all"} disabled={isPending}>
            <SelectTrigger className="w-full">
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
            value={locationFilter}
            onChange={(e) => handleLocationInputChange(e.target.value)}
            onBlur={applyLocationFilter}
            onKeyDown={handleLocationKeyDown}
            disabled={isPending}
            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Sort Control */}
        <div className="flex justify-end">
          <Select
            onValueChange={(value) => handleSortChange(value as "newest" | "oldest")}
            value={sortOrder}
            disabled={isPending}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rendit sipas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Më të rejat</SelectItem>
              <SelectItem value="oldest">Më të vjetrat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-semibold">Gabim gjatë ngarkimit të listimeve</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Listings Grid or Empty State */}
      {initialListings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {isPending ? "Duke kërkuar listimeve..." : "Nuk u gjetën shpallje që përputhen me kriteret."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {initialListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onContact={handleContactClick} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          disabled={page <= 1 || isPending}
          onClick={() => handlePageChange(Math.max(1, page - 1))}
        >
          ← Më parë
        </Button>

        <div className="text-sm text-gray-600 space-x-2">
          <span>Faqja {page}</span>
          {isPending && <span className="italic text-gray-500">Duke u ngarkuar...</span>}
        </div>

        <Button
          variant="outline"
          disabled={!hasMore || isPending}
          onClick={() => handlePageChange(page + 1)}
        >
          Më pas →
        </Button>
      </div>
    </div>
  )
}
