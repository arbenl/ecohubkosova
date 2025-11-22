"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useState, useEffect } from "react"

interface FiltersV2Props {
    locale: string
}

// Flow type options for filtering
const FLOW_TYPE_OPTIONS = [
    { value: "", label: { en: "All", sq: "Të gjitha" } },
    {
        value: "OFFER_MATERIAL",
        label: { en: "Materials", sq: "Materiale" },
    },
    {
        value: "OFFER_RECYCLED_PRODUCT",
        label: { en: "Products", sq: "Produkte" },
    },
    {
        value: "SERVICE_REPAIR,SERVICE_REFURBISH,SERVICE_COLLECTION",
        label: { en: "Services", sq: "Shërbime" },
    },
    {
        value: "REQUEST_MATERIAL",
        label: { en: "Requests", sq: "Kërkesa" },
    },
]

export function FiltersV2({ locale }: FiltersV2Props) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Local state for search input (debounced)
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
    const currentFlowType = searchParams.get("flowType") || ""

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ q: searchQuery || undefined })
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Update URL with new filter values
    const updateFilters = (updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })

        // Reset to page 1 when filters change
        params.delete("page")

        router.push(`?${params.toString()}`, { scroll: false })
    }

    const handleFlowTypeChange = (value: string) => {
        updateFilters({ flowType: value || undefined })
    }

    const clearSearch = () => {
        setSearchQuery("")
        updateFilters({ q: undefined })
    }

    const hasActiveFilters = searchQuery || currentFlowType

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={
                        locale === "sq"
                            ? "Kërko materiale, produkte..."
                            : "Search materials, products..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                />
                {searchQuery && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Flow Type Filters */}
            <div className="flex flex-wrap gap-2">
                {FLOW_TYPE_OPTIONS.map((option) => {
                    const isActive = currentFlowType === option.value
                    const label = locale === "sq" ? option.label.sq : option.label.en

                    return (
                        <Button
                            key={option.value}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFlowTypeChange(option.value)}
                            className={
                                isActive
                                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                    : "hover:border-green-600 hover:text-green-700"
                            }
                        >
                            {label}
                        </Button>
                    )
                })}
            </div>

            {/* Clear all filters */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setSearchQuery("")
                        router.push(window.location.pathname, { scroll: false })
                    }}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <X className="mr-1 h-3 w-3" />
                    {locale === "sq" ? "Pastro filtrat" : "Clear filters"}
                </Button>
            )}
        </div>
    )
}
