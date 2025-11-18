import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import MarketplaceClientPage from "./marketplace-client-page"
import { getListingsData } from "./actions"
import { getServerUser } from "@/lib/supabase/server"

interface MarketplacePageProps {
  searchParams: Promise<{
    type?: string
    search?: string
    category?: string
    page?: string
    condition?: string
    location?: string
    sort?: string
  }>
}

/**
 * Server component: Marketplace listing page.
 * 
 * Responsibilities:
 * - Await searchParams (Promise in Next.js 16)
 * - Fetch initial listings data on the server
 * - Check user auth for UI gating (e.g., show "Add listing" button)
 * - Pass minimal, typed props to client component
 * - Handle error states gracefully
 */
export default async function MarketplacePageServer({ searchParams }: MarketplacePageProps) {
  // Await searchParams as it's a Promise in Next.js 16
  const params = await searchParams

  // Fetch user for gating "Add listing" button
  const { user } = await getServerUser()

  // Fetch listings data server-side
  const listingsResult = await getListingsData(params)

  // Parse query parameters with safe defaults
  const type = params.type === "blej" ? "blej" : params.type === "shes" ? "shes" : "te-gjitha"
  const search = params.search || ""
  const category = params.category || "all"
  const page = Math.max(1, Number.parseInt(params.page || "1"))
  const condition = params.condition || ""
  const location = params.location || ""
  const sort = params.sort === "oldest" ? "oldest" : "newest"

  // Fixed category options
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

  return (
    <>
      <main className="flex-1 py-16">
        <div className="container px-4 md:px-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Tregu i Ekonomisë Qarkulluese
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Zbulo mundësitë e tregut për materiale, produkte dhe shërbime të qëndrueshme
              </p>
            </div>

            {/* Add Listing button - visible only to authenticated users */}
            {user && (
              <Button
                className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-2xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="marketplace/shto">
                  <Plus className="mr-2 h-5 w-5" /> Shto listim të ri
                </Link>
              </Button>
            )}
          </div>

          {/* Marketplace Client Component - handles filtering and display */}
          <MarketplaceClientPage
            initialListings={listingsResult.initialListings}
            hasMore={listingsResult.hasMoreInitial}
            initialTab={type}
            initialSearchQuery={search}
            initialSelectedCategory={category}
            initialPage={page}
            initialCondition={condition}
            initialLocation={location}
            initialSortOrder={sort}
            categories={categories}
            error={listingsResult.error}
          />
        </div>
      </main>
    </>
  )
}
