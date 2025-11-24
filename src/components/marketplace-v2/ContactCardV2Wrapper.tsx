"use client"

import { ContactCardV2 as ContactCardV2Component } from "./ContactCardV2"
import type { Listing } from "@/types"

interface ContactCardV2WrapperProps {
  listing: Listing
  contactCount?: number
}

export function ContactCardV2({ listing, contactCount }: ContactCardV2WrapperProps) {
  const handleContactInteraction = async () => {
    try {
      await fetch("/api/marketplace-v2/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: listing.id,
          type: "CONTACT",
        }),
      })
    } catch (error) {
      console.debug("Failed to track contact interaction:", error)
    }
  }

  return (
    <ContactCardV2Component
      listing={listing}
      listingUrl={typeof window !== "undefined" ? window.location.href : ""}
      contactCount={contactCount}
      onContactInteraction={handleContactInteraction}
    />
  )
}
