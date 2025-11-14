"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export interface Listing {
  id: string | number
  title: string
  description?: string
  price?: number
  location?: string
  imageUrl?: string
  email?: string
}

export interface ListingCardProps {
  listing: Listing
  /**
   * Shkaktohet kur përdoruesi klikon “Kontakto”.
   * The parent page can open the email-reveal modal from here.
   */
  onContact: (listing: Listing) => void
  className?: string
}

/**
 * Kartë listimi për seksionin “Tregu”.
 */
export function ListingCard({ listing, onContact, className }: ListingCardProps) {
  return (
    <Card className={className}>
      {listing.imageUrl ? (
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          <Image
            src={listing.imageUrl || "/placeholder.svg"}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            priority={false}
          />
        </div>
      ) : null}

      <CardHeader className="space-y-1">
        <h3 className="text-lg font-semibold leading-none">{listing.title}</h3>

        {listing.price !== undefined ? <p className="text-sm text-muted-foreground">{listing.price} €</p> : null}

        {listing.location ? <p className="text-sm text-muted-foreground">{listing.location}</p> : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {listing.description ? <p className="text-sm line-clamp-3">{listing.description}</p> : null}

        <Button variant="secondary" className="w-full" onClick={() => onContact(listing)}>
          <Mail className="mr-2 h-4 w-4" />
          {"Kontakto"}
        </Button>
      </CardContent>
    </Card>
  )
}
