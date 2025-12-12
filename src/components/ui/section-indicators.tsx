"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

// Section colors - keeping emerald primary
export const sectionColors = {
  marketplace: {
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    accent: "bg-emerald-500",
    icon: "text-emerald-600",
    light: "bg-emerald-100/50",
  },
  organizations: {
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    accent: "bg-blue-500",
    icon: "text-blue-600",
    light: "bg-blue-100/50",
  },
  knowledge: {
    gradient: "from-purple-500 to-pink-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    accent: "bg-purple-500",
    icon: "text-purple-600",
    light: "bg-purple-100/50",
  },
  dashboard: {
    gradient: "from-teal-500 to-cyan-500",
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    accent: "bg-teal-500",
    icon: "text-teal-600",
    light: "bg-teal-100/50",
  },
  admin: {
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    accent: "bg-amber-500",
    icon: "text-amber-600",
    light: "bg-amber-100/50",
  },
} as const

export type SectionType = keyof typeof sectionColors

interface SectionHeaderProps {
  section: SectionType
  eyebrow?: string
  title: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
  className?: string
}

export function SectionHeader({
  section,
  eyebrow,
  title,
  description,
  icon,
  actions,
  className,
}: SectionHeaderProps) {
  const colors = sectionColors[section]

  return (
    <div className={cn("relative", className)}>
      {/* Colored top accent bar */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-gradient-to-r",
          colors.gradient
        )}
      />

      <div className={cn("pt-6 pb-4 px-6 rounded-xl border", colors.bg, colors.border)}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            {icon && (
              <div className={cn("p-3 rounded-xl", colors.light)}>
                <div className={colors.icon}>{icon}</div>
              </div>
            )}
            <div>
              {eyebrow && (
                <p
                  className={cn(
                    "text-xs uppercase tracking-widest font-semibold mb-1",
                    colors.text
                  )}
                >
                  {eyebrow}
                </p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
              {description && <p className="mt-1 text-gray-600 max-w-2xl">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  )
}

// Simple colored accent line for page sections
interface SectionAccentProps {
  section: SectionType
  className?: string
}

export function SectionAccent({ section, className }: SectionAccentProps) {
  const colors = sectionColors[section]
  return (
    <div className={cn("h-1 w-16 rounded-full bg-gradient-to-r", colors.gradient, className)} />
  )
}

// Colored badge for section identification
interface SectionBadgeProps {
  section: SectionType
  children: ReactNode
  className?: string
}

export function SectionBadge({ section, children, className }: SectionBadgeProps) {
  const colors = sectionColors[section]
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colors.bg,
        colors.text,
        colors.border,
        "border",
        className
      )}
    >
      {children}
    </span>
  )
}

// Icon container with section color
interface SectionIconProps {
  section: SectionType
  children: ReactNode
  size?: "sm" | "md" | "lg"
  className?: string
}

export function SectionIcon({ section, children, size = "md", className }: SectionIconProps) {
  const colors = sectionColors[section]
  const sizeClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  }

  return (
    <div className={cn("rounded-xl", colors.light, sizeClasses[size], className)}>
      <div className={colors.icon}>{children}</div>
    </div>
  )
}

// Card with section-colored border accent
interface SectionCardProps {
  section: SectionType
  children: ReactNode
  className?: string
}

export function SectionCard({ section, children, className }: SectionCardProps) {
  const colors = sectionColors[section]

  return (
    <div className={cn("relative rounded-xl border bg-white shadow-sm overflow-hidden", className)}>
      <div
        className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r", colors.gradient)}
      />
      {children}
    </div>
  )
}
