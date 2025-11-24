"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bookmark } from "lucide-react"
import type { EcoListing } from "@/db/schema"
import SavedListingCard from "./saved-listing-card"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyStateBlock } from "@/components/shared/empty-state-block"

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
  const t = useTranslations("marketplace")
  const router = useRouter()
  const [listings, setListings] = useState(initialListings)

  const handleRemoveSave = (listingId: string) => {
    setListings(listings.filter((l) => l.id !== listingId))
  }

  if (listings.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <EmptyStateBlock
          icon={Bookmark}
          title={t("savedListings.emptyTitle")}
          description={t("savedListings.emptyBody")}
          actionLabel={t("savedListings.browseCTA")}
          actionHref={`/${locale}/marketplace`}
          className="mb-8"
        />

        <div className="mt-8 text-center">
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/my/organization`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Summary */}
      <PageHeader
        title={`${listings.length} ${t("savedListings.count", { count: listings.length })}`}
        subtitle="Opportunities you want to track"
        className="rounded-xl"
      >
        <Button variant="ghost" asChild>
          <Link href={`/${locale}/marketplace`}>Browse more</Link>
        </Button>
      </PageHeader>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <SavedListingCard key={listing.id} listing={listing} onRemove={handleRemoveSave} />
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 text-center">
        <Button variant="ghost" asChild>
          <Link href={`/${locale}/my/organization`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
