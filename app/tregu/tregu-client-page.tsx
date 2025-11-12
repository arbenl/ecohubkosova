"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ListingCard } from "@/components/listings/ListingCard"
import { Search, SlidersHorizontal } from "lucide-react"
import { Listing } from "@/types"
import { useRouter } from "next/navigation"

interface TreguClientPageProps {
  initialListings: Listing[]
  hasMoreInitial: boolean
  initialTab: string
  initialSearchQuery: string
  initialSelectedCategory: string
  categories: string[]
}

export default function TreguClientPage({
  initialListings,
  hasMoreInitial,
  initialTab,
  initialSearchQuery,
  initialSelectedCategory,
  categories,
}: TreguClientPageProps) {
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [filters, setFilters] = useState({
    category: initialSelectedCategory === "all" ? "" : initialSelectedCategory,
    condition: "",
    location: "",
  })
  const [sortOrder, setSortOrder] = useState(initialTab === "te-gjitha" ? "newest" : initialTab)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)

  useEffect(() => {
    // When initialListings change (e.g., after a server revalidation), update the state
    setListings(initialListings)
  }, [initialListings])

  useEffect(() => {
    const filteredListings = initialListings
      .filter((listing) => {
        const matchesCategory = filters.category ? listing.kategori === filters.category : true
        const matchesCondition = filters.condition ? listing.gjendja === filters.condition : true
        const matchesLocation = filters.location
          ? listing.vendndodhja.toLowerCase().includes(filters.location.toLowerCase())
          : true
        const matchesSearch = searchQuery
          ? listing.titulli.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.pershkrimi.toLowerCase().includes(searchQuery.toLowerCase())
          : true
        return matchesCategory && matchesCondition && matchesLocation && matchesSearch
      })
      .sort((a, b) => {
        if (sortOrder === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        if (sortOrder === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
        return 0
      })

    setListings(filteredListings)
  }, [filters, sortOrder, searchQuery, initialListings])

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }))
  }

  const handleSortChange = (value: string) => {
    setSortOrder(value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const uniqueConditions = Array.from(new Set(initialListings.map((listing) => listing.gjendja)))
  const router = useRouter()

  const handleContactClick = (listing: Listing) => {
    router.push(`/tregu/${listing.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Tregu i Qarkullueshëm</h1>

      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Kërko sipas titullit ose përshkrimit..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <Button className="md:hidden flex items-center justify-center gap-2 bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200">
            <SlidersHorizontal className="w-5 h-5" /> Filtro
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select
            onValueChange={(value) => handleFilterChange("category", value === "all" ? "" : value)}
            value={filters.category}
          >
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
            onValueChange={(value) => handleFilterChange("condition", value === "all" ? "" : value)}
            value={filters.condition}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Gjendja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha gjendjet</SelectItem>
              {uniqueConditions.filter(Boolean).map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Vendndodhja"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end">
          <Select onValueChange={handleSortChange} value={sortOrder}>
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

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">Nuk u gjetën shpallje që përputhen me kriteret.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onContact={handleContactClick} />
          ))}
        </div>
      )}
    </div>
  )
}
