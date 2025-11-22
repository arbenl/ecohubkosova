"use client"

import { useEffect } from "react"

interface InteractionTrackerProps {
    listingId: string
    type: "VIEW" | "CONTACT" | "SAVE" | "SHARE"
    metadata?: Record<string, any>
}

export function InteractionTracker({ listingId, type, metadata }: InteractionTrackerProps) {
    useEffect(() => {
        // Only track VIEW on mount, and only once per page load
        if (type === "VIEW") {
            const trackView = async () => {
                try {
                    await fetch("/api/marketplace-v2/interactions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            listingId,
                            type,
                            metadata,
                        }),
                    })
                    // Silently handle errors - don't show to user
                } catch (error) {
                    // Silently fail - interaction tracking is not critical
                    console.debug("Failed to track view interaction:", error)
                }
            }

            trackView()
        }
    }, [listingId, type, metadata])

    // This component doesn't render anything
    return null
}