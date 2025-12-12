/**
 * EcoHub Kosova – App Shell Component
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, ChevronDown, Plus, Menu, X } from "lucide-react"
import { useState } from "react"

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  description?: string
}

interface AppShellProps {
  children: ReactNode
  navItems: NavItem[]
  ctaLabel: string
  heading: string
  eyebrow?: string
}

export function AppShell({ children, navItems, ctaLabel, heading, eyebrow }: AppShellProps) {
  const t = useTranslations("DashboardV2")
  const tAuth = useTranslations("auth")
  const { user, signOut, signOutPending, isLoading } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Normalize pathname for comparison (remove locale prefix)
  const normalizedPath = pathname.replace(/^\/[a-zA-Z-]+/, "")

  // Get user display name or email
  const userDisplayName = user?.user_metadata?.full_name || user?.email || tAuth("user")
  const userEmail = user?.email

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dashboard ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30" />

        {/* Subtle circular patterns */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-teal-100/20 blur-3xl" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8 relative z-10">
        {/* Mobile menu button and user info bar */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div>
                {eyebrow && (
                  <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">
                    {eyebrow}
                  </p>
                )}
                <h2 className="text-sm font-bold text-gray-900">{heading}</h2>
              </div>
            </div>

            {/* User dropdown - mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isLoading}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <User className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userDisplayName}</p>
                    {userEmail && (
                      <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    {t("nav.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my/account" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("nav.account")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  disabled={signOutPending}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {signOutPending ? tAuth("signingOut") : tAuth("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 space-y-1">
                {eyebrow && (
                  <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">
                    {eyebrow}
                  </p>
                )}
                <h2 className="text-lg font-bold text-gray-900">{heading}</h2>
              </div>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active =
                    normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-emerald-50",
                        active
                          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
                          : "text-gray-700"
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
                        {item.description && (
                          <span className="block text-xs text-gray-500">{item.description}</span>
                        )}
                      </span>
                    </Link>
                  )
                })}
              </div>

              {/* User info section - Desktop */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center gap-3 px-3 py-2 h-auto justify-start text-left"
                      disabled={isLoading}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-gray-900 truncate">
                          {userDisplayName}
                        </span>
                        {userEmail && (
                          <span className="block text-xs text-gray-500 truncate">{userEmail}</span>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/my/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        {t("nav.profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my/account" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        {t("nav.account")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      disabled={signOutPending}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {signOutPending ? tAuth("signingOut") : tAuth("signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3">
                <Button asChild size="sm" className="w-full justify-center eco-gradient">
                  <Link href="/marketplace/add">
                    <Plus className="h-4 w-4 mr-2" />
                    {ctaLabel}
                  </Link>
                </Button>
              </div>
            </nav>
          </aside>

          {/* Mobile sidebar overlay */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Mobile sidebar */}
          <aside
            className={cn(
              "fixed left-0 top-0 z-40 h-full w-72 transform bg-white shadow-xl transition-transform duration-200 lg:hidden",
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                {eyebrow && (
                  <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold">
                    {eyebrow}
                  </p>
                )}
                <h2 className="text-lg font-bold text-gray-900">{heading}</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 h-[calc(100%-140px)] overflow-y-auto">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active =
                    normalizedPath === item.href || normalizedPath.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-emerald-50",
                        active
                          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
                          : "text-gray-700"
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
                        {item.description && (
                          <span className="block text-xs text-gray-500">{item.description}</span>
                        )}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
              <Button asChild size="sm" className="w-full justify-center eco-gradient">
                <Link href="/marketplace/add" onClick={() => setMobileMenuOpen(false)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {ctaLabel}
                </Link>
              </Button>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
