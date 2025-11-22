"use client"

import { ContactCardV2 as ContactCardV2Component } from "./ContactCardV2"

interface ContactCardV2WrapperProps {
    email: string | null
    organizationName?: string | null
    listingTitle: string
    listingId: string
    contactCount?: number
}

export function ContactCardV2({
    email,
    organizationName,
    listingTitle,
    listingId,
    contactCount
}: ContactCardV2WrapperProps) {
    const handleContactInteraction = async () => {
        try {
            await fetch("/api/marketplace-v2/interactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    listingId,
                    type: "CONTACT",
                }),
            })
            // Silently handle errors
        } catch (error) {
            console.debug("Failed to track contact interaction:", error)
        }
    }

    return (
        <ContactCardV2Component
            email={email}
            organizationName={organizationName}
            listingTitle={listingTitle}
            listingUrl={typeof window !== "undefined" ? window.location.href : ""}
            contactCount={contactCount}
            onContactInteraction={handleContactInteraction}
        />
    )
}