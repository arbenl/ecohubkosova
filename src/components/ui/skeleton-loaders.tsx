/**
 * EcoHub Kosova – Skeleton Loading Components
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />
}

/**
 * Skeleton card for marketplace listings
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-gray-100 bg-white p-4 shadow-sm", className)}>
      {/* Image placeholder */}
      <Skeleton className="aspect-[4/3] w-full rounded-xl mb-4" />

      {/* Badge placeholder */}
      <Skeleton className="h-5 w-16 rounded-full mb-3" />

      {/* Title placeholder */}
      <Skeleton className="h-5 w-3/4 mb-2" />

      {/* Description placeholder */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />

      {/* Footer placeholder */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  )
}

/**
 * Grid of skeleton cards for marketplace loading
 */
export function SkeletonCardGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for article cards
 */
export function SkeletonArticleCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm",
        className
      )}
    >
      {/* Image placeholder */}
      <Skeleton className="aspect-video w-full" />

      <div className="p-5">
        {/* Category placeholder */}
        <Skeleton className="h-4 w-20 rounded-full mb-3" />

        {/* Title placeholder */}
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-3" />

        {/* Meta placeholder */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for organization cards
 */
export function SkeletonOrganizationCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-gray-100 bg-white p-6 shadow-sm", className)}>
      <div className="flex items-start gap-4">
        {/* Logo placeholder */}
        <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Name placeholder */}
          <Skeleton className="h-5 w-3/4 mb-2" />

          {/* Description placeholder */}
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-3" />

          {/* Tags placeholder */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for page header
 */
export function SkeletonPageHeader() {
  return (
    <div className="mb-8">
      <Skeleton className="h-10 w-64 mb-3" />
      <Skeleton className="h-5 w-96 max-w-full" />
    </div>
  )
}

/**
 * Skeleton for detail page
 */
export function SkeletonDetailPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
        {/* Main content */}
        <div>
          <Skeleton className="aspect-video w-full rounded-2xl mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-2/3 mb-6" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-full rounded-xl mb-3" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
