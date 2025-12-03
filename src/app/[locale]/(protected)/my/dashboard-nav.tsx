"use client"

import { usePathname } from "@/i18n/routing"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

type NavItem = {
  label: string
  href: string
  icon: ReactNode
  description?: string
}

export function DashboardNav({
  items,
  ctaLabel,
  heading,
  eyebrow,
}: {
  items: NavItem[]
  ctaLabel: string
  heading: string
  eyebrow?: string
}) {
  const pathname = usePathname()
  const normalizedPath = pathname.replace(/^\/[a-zA-Z-]+/, "")

  return (
    <nav className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 space-y-1">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-lg font-bold text-gray-900">{heading}</h2>
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const active = normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-emerald-50",
                active ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100" : "text-gray-700"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border",
                  active
                    ? "border-emerald-200 bg-white text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                )}
              >
                {item.icon}
              </span>
              <span className="flex-1">
                <span className="block leading-tight">{item.label}</span>
                {item.description ? (
                  <span className="block text-xs text-gray-500">{item.description}</span>
                ) : null}
              </span>
            </Link>
          )
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button asChild size="sm" className="w-full justify-center eco-gradient">
          <Link href="/marketplace/add">{ctaLabel}</Link>
        </Button>
      </div>
    </nav>
  )
}
