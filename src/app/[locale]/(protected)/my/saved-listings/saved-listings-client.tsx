"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Bookmark } from "lucide-react"
import type { EcoListing } from "@/db/schema"
import SavedListingCard from "./saved-listing-card"

interface SavedListingsClientProps {
  initialListings: EcoListing[]
  total: number
  locale: string
}

export default function SavedListingsClient({
  initialListings,
  total,
  locale,
}: SavedListingsClientProps) {
  const t = useTranslations("marketplace-v2")
  const router = useRouter()
  const [listings, setListings] = useState(initialListings)

  const handleRemoveSave = (listingId: string) => {
    setListings(listings.filter((l) => l.id !== listingId))
  }

  if (listings.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center py-12">
            <div className="mb-4">
              <Bookmark className="h-16 w-16 text-gray-300 mx-auto" />
            </div>
            <CardTitle className="text-2xl mb-2">
              {t("savedListings.emptyTitle")}
            </CardTitle>
            <CardDescription className="text-base mb-6">
              {t("savedListings.emptyBody")}
            </CardDescription>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href={`/${locale}/marketplace-v2`}>
                {t("savedListings.browseCTA")}
              </Link>
            </Button>
          </CardHeader>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/dashboard`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Summary */}
      <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Bookmark className="h-6 w-6 text-emerald-600" />
                {total} {t("savedListings.count", { count: total })}
              </CardTitle>
              <CardDescription>
                Opportunities you want to track
              </CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link href={`/${locale}/marketplace-v2`}>
                Browse more
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <SavedListingCard
            key={listing.id}
            listing={listing}
            onRemove={handleRemoveSave}
          />
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 text-center">
        <Button variant="ghost" asChild>
          <Link href={`/${locale}/dashboard`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
