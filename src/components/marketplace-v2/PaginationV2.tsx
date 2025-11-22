"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"

interface PaginationV2Props {
    page: number
    limit: number
    totalCount: number
    onPageChange: (page: number) => void
}

export function PaginationV2({ page, limit, totalCount, onPageChange }: PaginationV2Props) {
    const t = useTranslations("marketplace-v2")
    const safeLimit = Math.max(1, limit)
    const totalPages = Math.ceil((totalCount || 0) / safeLimit)

    if (totalPages <= 1) return null

    const hasPrevious = page > 1
    const hasNext = page < totalPages

    return (
        <div className="flex items-center justify-center gap-2 py-8">
            <Button
                aria-label={t("pagination.previous")}
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={!hasPrevious}
                className="gap-1 hover:border-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="h-4 w-4" />
                {t("pagination.previous")}
            </Button>

            <div className="px-4 py-2 text-sm text-muted-foreground">
                {t("pagination.pageOf", { page, totalPages })}
            </div>

            <Button
                aria-label={t("pagination.next")}
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={!hasNext}
                className="gap-1 hover:border-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t("pagination.next")}
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
