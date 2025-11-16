"use client"

import { type FormEvent, type KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ListingCard } from "@/components/listings/ListingCard"
import { Listing } from "@/types"
import { Search, SlidersHorizontal } from "lucide-react"
import { useMarketplaceFilters } from "@/hooks/use-marketplace-filters"

interface MarketplaceClientPageProps {
  initialListings: Listing[]
  hasMoreInitial: boolean
  initialTab: string
  initialSearchQuery: string
  initialSelectedCategory: string
  initialPage: number
  initialCondition: string
  initialLocation: string
  initialSortOrder: "newest" | "oldest"
  categories: string[]
}

const TAB_OPTIONS = [
  { value: "te-gjitha", label: "Të gjitha" },
  { value: "shes", label: "Për Shitje" },
  { value: "blej", label: "Kërkoj të Blej" },
]

export default function MarketplaceClientPage({
  initialListings,
  hasMoreInitial,
  initialTab,
  initialSearchQuery,
  initialSelectedCategory,
  initialPage,
  initialCondition,
  initialLocation,
  initialSortOrder,
  categories,
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

  const listings = initialListings

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Tregu i Qarkullueshëm</h1>

      <div className="flex flex-wrap gap-3 justify-center mb-8">
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

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form className="flex flex-col md:flex-row gap-4 mb-4" onSubmit={handleSearchSubmit}>
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Kërko sipas titullit ose përshkrimit..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
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

          <Select
            onValueChange={handleConditionChange}
            value={conditionFilter || "all"}
          >
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

          <Input
            type="text"
            placeholder="Vendndodhja"
            value={locationFilter}
            onChange={(e) => handleLocationInputChange(e.target.value)}
            onBlur={applyLocationFilter}
            onKeyDown={handleLocationKeyDown}
            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end">
          <Select onValueChange={(value) => handleSortChange(value as "newest" | "oldest")} value={sortOrder}>
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

      {listings.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">Nuk u gjetën shpallje që përputhen me kriteret.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onContact={handleContactClick} />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-10">
        <Button
          variant="outline"
          disabled={page <= 1 || isPending}
          onClick={() => handlePageChange(Math.max(1, page - 1))}
        >
          Më parë
        </Button>
        <div className="text-sm text-gray-500">
          Faqja {page}
          {isPending && <span className="ml-2 italic">Duke u ngarkuar...</span>}
        </div>
        <Button variant="outline" disabled={!hasMoreInitial || isPending} onClick={() => handlePageChange(page + 1)}>
          Më pas
        </Button>
      </div>
    </div>
  )
}
