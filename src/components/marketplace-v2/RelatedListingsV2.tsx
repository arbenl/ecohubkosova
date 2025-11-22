"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { ListingCardV2 } from "./ListingCardV2"

interface RelatedListingsV2Props {
    currentListingId: string
    categoryId?: string
    tags?: string[]
    locale: string
}

interface RelatedListing {
    id: string
    title: string
    description: string | null
    flow_type: string
    price: string | null
    currency: string | null
    pricing_type: string
    city: string | null
    eco_labels: string[] | null
    tags: string[] | null
    category_name_en: string | null
    category_name_sq: string | null
}

export function RelatedListingsV2({
    currentListingId,
    categoryId,
    tags,
    locale
}: RelatedListingsV2Props) {
    const t = useTranslations("marketplace")
    const [relatedListings, setRelatedListings] = useState<RelatedListing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchRelatedListings() {
            try {
                setLoading(true)
                setError(null)

                const params = new URLSearchParams({
                    currentId: currentListingId,
                    locale,
                    limit: "6",
                })

                if (categoryId) {
                    params.append("categoryId", categoryId)
                }

                if (tags && tags.length > 0) {
                    params.append("tags", tags.join(","))
                }

                const response = await fetch(`/api/marketplace-v2/related?${params}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch related listings")
                }

                const data = await response.json()
                setRelatedListings(data.listings || [])
            } catch (err) {
                console.error("Error fetching related listings:", err)
                setError("Failed to load related listings")
            } finally {
                setLoading(false)
            }
        }

        fetchRelatedListings()
    }, [currentListingId, categoryId, tags, locale])

    if (loading) {
        return (
            <div className="rounded-xl border border-green-100 bg-white shadow-sm p-6">
                <h2 className="text-xl font-semibold text-green-900 mb-4">
                    {t("detail.relatedListings")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 rounded-lg h-48 mb-3"></div>
                            <div className="bg-gray-200 rounded h-4 mb-2"></div>
                            <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error || relatedListings.length === 0) {
        return null // Don't show the section if there are no related listings or error
    }

    return (
        <div className="rounded-xl border border-green-100 bg-white shadow-sm p-6">
            <h2 className="text-xl font-semibold text-green-900 mb-4">
                {t("detail.relatedListings")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedListings.map((listing) => (
                    <ListingCardV2
                        key={listing.id}
                        listing={listing}
                        locale={locale}
                    />
                ))}
            </div>
        </div>
    )
}