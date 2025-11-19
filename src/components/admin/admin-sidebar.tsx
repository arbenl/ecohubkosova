"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Users, Building, BookOpen, ShoppingCart, LayoutDashboard, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { SignOutButton } from "@/components/sign-out-button"

export function AdminSidebar() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('admin')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleBeforeSignOut = () => setIsMobileMenuOpen(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("admin-mobile-sidebar")
      const menuButton = document.getElementById("admin-mobile-menu-button")

      if (
        isMobileMenuOpen &&
        sidebar &&
        menuButton &&
        !sidebar.contains(event.target as Node) &&
        !menuButton.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobileMenuOpen])

  const routes = [
    {
      label: t("panel"),
      icon: LayoutDashboard,
      href: `/${locale}/admin`,
      active: pathname === `/${locale}/admin`,
    },
    {
      label: "Profili",
      icon: User,
      href: `/${locale}/profile`,
      active: pathname === `/${locale}/profile`,
    },
    {
      label: t("users"),
      icon: Users,
      href: `/${locale}/admin/users`,
      active: pathname === `/${locale}/admin/users`,
    },
    {
      label: t("organizations"),
      icon: Building,
      href: `/${locale}/admin/organizations`,
      active: pathname === `/${locale}/admin/organizations`,
    },
    {
      label: t("articles"),
      icon: BookOpen,
      href: `/${locale}/admin/articles`,
      active: pathname === `/${locale}/admin/articles`,
    },
    {
      label: t("listings"),
      icon: ShoppingCart,
      href: `/${locale}/admin/listings`,
      active: pathname === `/${locale}/admin/listings`,
    },
  ]

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-3 bg-white border-b border-gray-200 sticky top-0 z-40">
        <Button
          id="admin-mobile-menu-button"
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <Link href={`/${locale}/admin`} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg eco-gradient flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
          <span className="text-base font-bold bg-gradient-to-r from-[#00C896] to-[#00A07E] bg-clip-text text-transparent">
            {t("adminPanel")}
          </span>
        </Link>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />}

      {/* Mobile Sidebar */}
      <div
        id="admin-mobile-sidebar"
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <Link href={`/${locale}/admin`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg eco-gradient flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#00C896] to-[#00A07E] bg-clip-text text-transparent">
              Admin Panel
            </span>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="flex-1 overflow-auto py-4 px-3">
          <nav className="flex flex-col gap-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95",
                  route.active
                    ? "bg-gradient-to-r from-[#00C896] to-[#00A07E] text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
                )}
              >
                <route.icon className="h-5 w-5 flex-shrink-0" />
                <span>{route.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Sidebar Footer */}
        <div className="p-3 border-t border-gray-200">
          <SignOutButton
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-lg py-3 text-sm"
            onBeforeSignOut={handleBeforeSignOut}
          />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-72 md:bg-white md:border-r md:border-gray-200 md:h-screen md:sticky md:top-0">
        {/* Desktop Header */}
        <div className="p-6 border-b border-gray-200">
          <Link href={`/${locale}/admin`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl eco-gradient flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#00C896] to-[#00A07E] bg-clip-text text-transparent">
              {t("adminPanel")}
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="flex-1 overflow-auto py-6 px-4">
          <nav className="flex flex-col gap-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  route.active
                    ? "bg-gradient-to-r from-[#00C896] to-[#00A07E] text-white shadow-lg"
                    : "text-gray-600 hover:text-[#00C896] hover:bg-gray-50",
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Footer */}
        <div className="p-4 border-t border-gray-200">
          <SignOutButton
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-xl"
          />
        </div>
      </div>
    </>
  )
}
