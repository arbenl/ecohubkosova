"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Package } from "lucide-react"
import { useState } from "react"
import MarketplaceClientPage from "./marketplace-client-page"

interface MarketplaceLandingClientProps {
  locale: string
  user: any
  initialSearchParams: Record<string, string | string[] | undefined>
}

export default function MarketplaceLandingClient({
  locale,
  user,
  initialSearchParams,
}: MarketplaceLandingClientProps) {
  // Note: Using hardcoded text for landing page to avoid i18n namespace loading issues
  // The marketplace-landing namespace will be added in a future update
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/${locale}/marketplace?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <main className="flex-1">
      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-eco-50 via-white to-eco-50 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              The Marketplace for Circular Economy
            </h1>
            <p className="mb-8 text-lg md:text-xl text-gray-600 leading-relaxed">
              Buy, sell, and exchange products sustainably. Connect with recyclers, collectors, and services in your community.
            </p>

            {/* Hero Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mb-8 flex gap-2">
              <Input
                placeholder="Search listings, categories..."
                className="rounded-full border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-full px-6 font-semibold transition-all duration-300"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>

            {/* Hero CTAs */}
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button
                className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-full px-8 py-3 font-semibold transition-all duration-300"
                asChild
              >
                <Link href={`/${locale}/marketplace?type=blej`}>
                  Browse Listings
                </Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-8 py-3 font-semibold hover:bg-gray-50"
                asChild
              >
                <Link href={`/${locale}/organizations`}>
                  Find Recyclers & Services
                </Link>
              </Button>
              {user && (
                <Button
                  variant="outline"
                  className="rounded-full px-8 py-3 font-semibold hover:bg-gray-50"
                  asChild
                >
                  <Link href={`/${locale}/marketplace/add`}>
                    Create Listing for My Organization
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== MARKETPLACE SECTION ========== */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900">
            The Marketplace for Circular Economy
          </h2>
          <MarketplaceClientPage locale={locale} initialSearchParams={initialSearchParams} />
        </div>
      </section>

      {/* ========== RECYCLERS TEASER ========== */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Recyclers & Services Directory
            </h2>
            <p className="text-lg text-gray-600">Discover certified organizations offering recycling, collection, and circular economy services</p>
          </div>

          <div className="text-center">
            <Button
              className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-full px-8 py-3 font-semibold transition-all duration-300"
              asChild
            >
              <Link href={`/${locale}/organizations`}>
                View All Recyclers & Services
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== FOR ORGANIZATIONS SECTION ========== */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-eco-500 to-eco-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For Organizations</h2>
            <p className="text-lg leading-relaxed opacity-90">Grow your eco impact: list products, track analytics, and collaborate with your team.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              "Create and manage eco-friendly listings",
              "Track views, contacts, and shares in real-time",
              "Invite and manage team members",
              "Connect with the circular economy community",
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-3">
                <Package className="h-6 w-6 flex-shrink-0" />
                <p className="font-semibold">{feature}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            {!user ? (
              <>
                <Button
                  className="bg-white text-eco-600 hover:bg-gray-100 rounded-full px-8 py-3 font-semibold transition-all duration-300"
                  asChild
                >
                  <Link href={`/${locale}/auth/signup`}>Create Organization Profile</Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 rounded-full px-8 py-3 font-semibold transition-all duration-300"
                  asChild
                >
                  <Link href={`/${locale}/auth/login`}>Start Organization Onboarding</Link>
                </Button>
              </>
            ) : (
              <Button
                className="bg-white text-eco-600 hover:bg-gray-100 rounded-full px-8 py-3 font-semibold transition-all duration-300"
                asChild
              >
                <Link href={`/${locale}/my/organization`}>Go to My Organization</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ========== YOUR ECOHUB PANEL (LOGGED-IN ONLY) ========== */}
      {user && (
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Saved Listings Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Saved Listings
                    </h3>
                    <p className="text-sm text-gray-600">
                      Last 30 Days
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-eco-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-6">0</p>
                <Button
                  variant="outline"
                  className="w-full rounded-lg"
                  asChild
                >
                  <Link href={`/${locale}/my/profile`}>View All Saved</Link>
                </Button>
              </div>

              {/* Organization Impact Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      Organization Impact
                    </h3>
                    <p className="text-sm text-gray-600">
                      Last 30 Days
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-eco-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-6">--</p>
                <Button
                  variant="outline"
                  className="w-full rounded-lg"
                  asChild
                >
                  <Link href={`/${locale}/my/organization`}>View Analytics</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== STORY SECTION ========== */}
      <section className="bg-gray-900 text-white py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About EcoHub Kosova</h2>
            <p className="text-lg leading-relaxed opacity-90">EcoHub Kosova is a digital marketplace connecting individuals and organizations in the circular economy. We make it easy to buy, sell, and exchange sustainably while supporting local businesses.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Active Organizations", value: "50+" },
              { label: "Eco Listings", value: "500+" },
              { label: "Communities Served", value: "3" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
