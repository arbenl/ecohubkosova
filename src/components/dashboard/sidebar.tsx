"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { LayoutDashboard, BookOpen, Users, ShoppingCart, User, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { SignOutButton } from "@/components/sign-out-button"

interface SidebarProps {
  userRole: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('navigation')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleBeforeSignOut = () => setIsMobileMenuOpen(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("mobile-sidebar")
      const menuButton = document.getElementById("mobile-menu-button")

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
      label: t('dashboard'),
      icon: LayoutDashboard,
      href: `/${locale}/my/organization`,
      active: pathname === `/${locale}/my/organization`,
    },
    {
      label: t('knowledge'),
      icon: BookOpen,
      href: `/${locale}/knowledge`,
      active: pathname === `/${locale}/knowledge`,
    },
    {
      label: t('directory'),
      icon: Users,
      href: `/${locale}/partners`,
      active: pathname === `/${locale}/partners`,
    },
    {
      label: t('marketplace'),
      icon: ShoppingCart,
      href: `/${locale}/marketplace`,
      active: pathname === `/${locale}/marketplace`,
    },
    {
      label: t('profile'),
      icon: User,
      href: `/${locale}/profile`,
      active: pathname === `/${locale}/profile`,
    },
  ]

  // Add admin route if user is admin
  if (userRole === "Admin") {
    routes.push({
      label: t('administration'),
      icon: Settings,
      href: `/${locale}/admin`,
      active: pathname.startsWith(`/${locale}/admin`),
    })
  }

  return (
    <>
      {/* Mobile Menu Button - Fixed Position */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button
          id="mobile-menu-button"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-14 h-14 rounded-full eco-gradient shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />}

      {/* Mobile Sidebar */}
      <div
        id="mobile-sidebar"
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <Link href={`/${locale}/home`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg eco-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#00C896] to-[#00A07E] bg-clip-text text-transparent">
              ECO HUB
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
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-lg py-3 text-sm bg-transparent"
            onBeforeSignOut={handleBeforeSignOut}
          />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-72 md:bg-white md:border-r md:border-gray-200 md:h-screen md:sticky md:top-0">
        {/* Desktop Navigation */}
        <div className="flex-1 overflow-auto py-6 px-4">
          <nav className="flex flex-col gap-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
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
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-xl bg-transparent"
          />
        </div>
      </div>
    </>
  )
}
