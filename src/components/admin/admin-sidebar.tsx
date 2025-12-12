"use client"

import { Link, usePathname } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Building2,
  Users,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Listimet",
    href: "/admin/listings",
    icon: Package,
  },
  {
    title: "Organizatat",
    href: "/admin/organizations",
    icon: Building2,
  },
  {
    title: "Përdoruesit",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Auditimet",
    href: "/admin/audits",
    icon: History,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Remove locale prefix for matching
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "")

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathWithoutLocale === "/admin" || pathWithoutLocale === "/admin/"
    }
    return pathWithoutLocale.startsWith(href)
  }

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="font-semibold text-gray-900">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  active ? "text-emerald-600" : "text-gray-400"
                )}
              />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-100">
        <Link
          href="/my"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Kthehu te Paneli" : undefined}
        >
          <Settings className="h-5 w-5 text-gray-400" />
          {!collapsed && <span>Kthehu te Paneli</span>}
        </Link>
      </div>
    </aside>
  )
}
