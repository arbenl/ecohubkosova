/**
 * EcoHub Kosova – Eco-Organizations Loading State
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

import { SkeletonOrganizationCard, SkeletonPageHeader } from "@/components/ui/skeleton-loaders"

export default function EcoOrganizationsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SkeletonPageHeader />

      {/* Organizations grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonOrganizationCard key={i} />
        ))}
      </div>
    </div>
  )
}
