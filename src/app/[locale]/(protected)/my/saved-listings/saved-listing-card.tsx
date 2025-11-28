"use client"

import { useState } from "react"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Trash2 } from "lucide-react"
import type { EcoListing } from "@/db/schema"
import SaveButton from "@/components/marketplace/SaveButton"

interface SavedListingCardProps {
  listing: EcoListing
  onRemove: (listingId: string) => void
}

export default function SavedListingCard({ listing, onRemove }: SavedListingCardProps) {
  const locale = useLocale()
  const t = useTranslations("marketplace-v2")
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await fetch("/api/marketplace-v2/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          type: "SAVE",
        }),
      })
      onRemove(listing.id)
    } catch (error) {
      console.error("Failed to remove from saved:", error)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 rounded-lg"
      aria-label={listing.title}
    >
      <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* Image Section */}
        {listing.metadata &&
        typeof listing.metadata === "object" &&
        "primary_image_url" in listing.metadata ? (
          <div className="relative h-40 w-full overflow-hidden bg-muted">
            <Image
              src={String((listing.metadata as any).primary_image_url)}
              alt={listing.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            />
          </div>
        ) : (
          <div className="relative h-40 w-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            <span className="text-xs text-emerald-600 font-medium">No image</span>
          </div>
        )}

        {/* Content */}
        <CardHeader className="space-y-2 pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-2 text-sm leading-snug flex-1">
              {listing.title}
            </h3>
            <Heart className="h-5 w-5 fill-emerald-500 text-emerald-500 flex-shrink-0" />
          </div>

          {/* Price */}
          {listing.price && (
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-emerald-600">
                {parseFloat(String(listing.price)).toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">€ / {listing.unit || "unit"}</span>
            </div>
          )}

          {/* Location */}
          {listing.city && <p className="text-xs text-gray-500 truncate">📍 {listing.city}</p>}
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {/* Description preview */}
          {listing.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{listing.description}</p>
          )}

          {/* Flow type badge */}
          <Badge variant="outline" className="text-xs">
            {t(`flowTypes.${listing.flow_type}`) || listing.flow_type}
          </Badge>

          {/* Actions */}
          <div className="flex gap-2 pt-2" onClick={(e) => e.preventDefault()}>
            <Button
              variant="default"
              size="sm"
              asChild
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Link href={`/marketplace/${listing.id}`}>View details</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title={t("savedListings.removedFromSaved")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
