"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

import { Listing } from "@/types"

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
      {listing.foto_url ? (
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          <Image
            src={listing.foto_url || "/placeholder.svg"}
            alt={listing.titulli}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            priority={false}
          />
        </div>
      ) : null}

      <CardHeader className="space-y-1">
        <h3 className="text-lg font-semibold leading-none">{listing.titulli}</h3>

        {listing.çmimi !== undefined ? <p className="text-sm text-muted-foreground">{listing.çmimi} €</p> : null}

        {listing.vendndodhja ? <p className="text-sm text-muted-foreground">{listing.vendndodhja}</p> : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {listing.pershkrimi ? <p className="text-sm line-clamp-3">{listing.pershkrimi}</p> : null}

        <Button variant="secondary" className="w-full" onClick={() => onContact(listing)}>
          <Mail className="mr-2 h-4 w-4" />
          {"Kontakto"}
        </Button>
      </CardContent>
    </Card>
  )
}
