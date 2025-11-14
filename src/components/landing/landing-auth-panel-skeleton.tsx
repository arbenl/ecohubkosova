"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function LandingAuthPanelSkeleton() {
  return (
    <div className="glass-card rounded-2xl border border-gray-100 bg-white/70 p-6 flex items-center gap-4 shadow-lg">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  )
}
