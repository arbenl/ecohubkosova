import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import MarketplaceClientPage from "./marketplace-client-page" // Will create this client component later
import { getListingsData } from "./actions" // Import the new server action
import { getServerUser } from "@/lib/supabase/server" // Keep for user check

interface TreguPageProps {
  searchParams: Promise<{
    lloji?: string
    search?: string
    category?: string
    page?: string
    condition?: string
    location?: string
    sort?: string
  }>
}

export default async function TreguPage({ searchParams }: TreguPageProps) {
  // Await searchParams as it's now a Promise in Next.js 16
  const params = await searchParams
  
  // Fetch user securely for gating UI
  const { user } = await getServerUser()

  const { initialListings, hasMoreInitial, error } = await getListingsData(params)

  const initialTab =
    params.lloji === "blej" ? "blej" : params.lloji === "shes" ? "shes" : "te-gjitha"
  const initialSearchQuery = params.search || ""
  const initialSelectedCategory = params.category || "all"
  const initialPage = Number.parseInt(params.page || "1")
  const initialCondition = params.condition || ""
  const initialLocation = params.location || ""
  const initialSortOrder = params.sort === "oldest" ? "oldest" : "newest"

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
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-12 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Tregu i Ekonomisë Qarkulluese
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Zbulo mundësitë e tregut për materiale, produkte dhe shërbime të qëndrueshme
              </p>
            </div>
            {user && (
              <Button
                className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-2xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/marketplace/shto">
                  <Plus className="mr-2 h-5 w-5" /> Shto listim të ri
                </Link>
              </Button>
            )}
          </div>

          <MarketplaceClientPage
            initialListings={initialListings}
            hasMoreInitial={hasMoreInitial}
            initialTab={initialTab}
            initialSearchQuery={initialSearchQuery}
            initialSelectedCategory={initialSelectedCategory}
            initialPage={Number.isNaN(initialPage) ? 1 : initialPage}
            initialCondition={initialCondition}
            initialLocation={initialLocation}
            initialSortOrder={initialSortOrder}
            categories={categories}
          />
        </div>
      </main>
    </>
  )
}
