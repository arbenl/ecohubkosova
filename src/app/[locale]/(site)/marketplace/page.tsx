import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import MarketplaceClientPage from "./marketplace-client-page"
import { getServerUser } from "@/lib/supabase/server"

interface MarketplacePageProps {
  params: {
    locale: string
  }
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function MarketplacePageServer({ params, searchParams }: MarketplacePageProps) {
  const { locale } = await params
  const { user } = await getServerUser()

  // ❌ Do NOT call db.get() or heavy auth/profile here
  // ✅ Only pass through lightweight things like filters if needed

  return (
    <main className="flex-1 py-16">
      <div className="container px-4 md:px-6">
        {/* Header */}
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
            <Button className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-2xl px-6 py-3 font-semibold transition-all duration-300 hover:scale-105" asChild>
              <Link href="marketplace/add">
                <Plus className="mr-2 h-5 w-5" /> Shto listim të ri
              </Link>
            </Button>
          )}
        </div>

        {/* Client Component - all data fetching happens here */}
        <MarketplaceClientPage
          locale={locale}
          initialSearchParams={searchParams ?? {}}
        />
      </div>
    </main>
  )
}
