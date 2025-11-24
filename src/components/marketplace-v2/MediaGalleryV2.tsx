"use client"

import Image from "next/image"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, ImageIcon } from "lucide-react"
import type { ListingMedia } from "@/app/[locale]/(site)/marketplace-v2/types"

interface MediaGalleryV2Props {
    media: ListingMedia[]
    title: string
    locale: string
}

export function MediaGalleryV2({ media, title, locale }: MediaGalleryV2Props) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    if (!media || media.length === 0) {
        return (
            <Card className="p-8 text-center border-green-100 bg-green-50/30" data-testid="media-gallery">
                <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 rounded-full bg-green-100">
                        <ImageIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-green-900">
                            {locale === "sq" ? "Pa fotografi" : "No photos yet"}
                        </h3>
                        <p className="text-sm text-green-700 max-w-sm">
                            {locale === "sq"
                                ? "Ky listim nuk ka fotografi të shtuara akoma."
                                : "This listing doesn't have photos added yet."
                            }
                        </p>
                    </div>
                </div>
            </Card>
        )
    }

    const primaryMedia = media.find(m => m.is_primary) || media[0]
    const sortedMedia = media.sort((a, b) => a.sort_order - b.sort_order)

    return (
        <div className="space-y-4" data-testid="media-gallery">
            {/* Primary Image */}
            <Card className="overflow-hidden border-green-100">
                <div className="relative aspect-video bg-green-50" data-testid="primary-image">
                    <Image
                        src={primaryMedia.url}
                        alt={primaryMedia.alt_text || title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {primaryMedia.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3">
                            <p className="text-sm">{primaryMedia.caption}</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Thumbnail Strip */}
            {sortedMedia.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {sortedMedia.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedIndex(index)}
                            data-testid="media-thumbnail"
                            className={`flex-shrink-0 relative aspect-square w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                index === selectedIndex
                                    ? "border-green-500 ring-2 ring-green-200"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <Image
                                src={item.url}
                                alt={item.alt_text || `${title} - ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Media Count Badge */}
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {sortedMedia.length} {locale === "sq" ? "fotografi" : "photo"}{sortedMedia.length !== 1 ? (locale === "sq" ? "" : "s") : ""}
                </Badge>
            </div>
        </div>
    )
}