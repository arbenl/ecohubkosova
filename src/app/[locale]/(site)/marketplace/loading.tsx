/**
 * EcoHub Kosova – Marketplace Loading State
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

import { SkeletonCardGrid, SkeletonPageHeader } from "@/components/ui/skeleton-loaders"

export default function MarketplaceLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SkeletonPageHeader />

      {/* Filter skeleton */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-10 w-36 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      {/* Cards grid */}
      <SkeletonCardGrid count={9} />
    </div>
  )
}
