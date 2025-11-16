"use client"

import { memo } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import type { Listing } from "@/types"

export interface ListingCardProps {
  /** Database listing object with Albanian column names */
  listing: Listing
  /** Callback triggered when user clicks "Kontakto" (Contact) button */
  onContact: (listing: Listing) => void
  /** Optional CSS class name for styling */
  className?: string
}

/**
 * ListingCard Component
 * 
 * Displays a marketplace listing in card format with:
 * - Product image (photo)
 * - Title (titulli)
 * - Price (cmimi) with currency
 * - Location (vendndodhja)
 * - Description preview (pershkrimi)
 * - Contact button
 * 
 * Uses Albanian database column names internally.
 * 
 * @component
 * @example
 * ```tsx
 * <ListingCard
 *   listing={listing}
 *   onContact={handleContactClick}
 *   className="hover:shadow-lg"
 * />
 * ```
 */
export const ListingCard = memo(function ListingCard({
  listing,
  onContact,
  className,
}: ListingCardProps) {
  const handleClick = () => {
    onContact(listing)
  }

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-lg ${className || ""}`}
      data-testid="listing-card"
    >
      {/* Image Section */}
      {listing.foto_url ? (
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <Image
            src={listing.foto_url}
            alt={listing.titulli}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            priority={false}
          />
        </div>
      ) : (
        <div className="relative h-40 w-full bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">No image</span>
        </div>
      )}

      {/* Header Section - Title, Price, Location */}
      <CardHeader className="space-y-2 pb-3">
        <h3 className="font-semibold line-clamp-2 text-sm leading-snug">
          {listing.titulli}
        </h3>

        {/* Price Display */}
        {listing.cmimi !== undefined && listing.cmimi !== null && (
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-green-600">
              {listing.cmimi.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              {listing.monedha || "€"}
            </span>
          </div>
        )}

        {/* Location Display */}
        {listing.vendndodhja && (
          <p className="text-xs text-muted-foreground truncate">
            📍 {listing.vendndodhja}
          </p>
        )}
      </CardHeader>

      {/* Content Section - Description & Action */}
      <CardContent className="space-y-3 pt-0">
        {/* Description Preview */}
        {listing.pershkrimi && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {listing.pershkrimi}
          </p>
        )}

        {/* Contact Button */}
        <Button
          variant="default"
          size="sm"
          className="w-full gap-2"
          onClick={handleClick}
          aria-label={`Contact seller of ${listing.titulli}`}
        >
          <Mail className="h-4 w-4" />
          <span>Kontakto</span>
        </Button>
      </CardContent>

      {/* Metadata Section - Category & Condition */}
      {(listing.kategori || listing.gjendja) && (
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          {listing.kategori && (
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
              {listing.kategori}
            </span>
          )}
          {listing.gjendja && (
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
              {listing.gjendja}
            </span>
          )}
        </div>
      )}
    </Card>
  )
})

ListingCard.displayName = "ListingCard"
