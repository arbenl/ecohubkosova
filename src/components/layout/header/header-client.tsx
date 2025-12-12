"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { SignOutButton } from "@/components/sign-out-button"
import { LanguageSwitcher } from "./language-switcher"

interface HeaderClientProps {
  fallbackUserName?: string | null
  fallbackUserEmail?: string | null
  userRole?: string | null
}

export default function HeaderClient({
  fallbackUserName,
  fallbackUserEmail,
  userRole,
}: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const t = useTranslations("navigation")
  const { user, isLoading } = useAuth()
  const derivedName =
    user?.email?.split("@")[0] || fallbackUserName || fallbackUserEmail?.split("@")[0]
  const isAuthenticated = Boolean(user || fallbackUserEmail)

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/marketplace" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl eco-gradient flex items-center justify-center text-white font-bold text-lg">
            E
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#00C896] to-[#00A07E] bg-clip-text text-transparent">
            ECO HUB KOSOVA
          </span>
        </Link>

        <nav className="hidden md:flex gap-8">
          <Link
            href="/marketplace"
            className="text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 relative group"
          >
            {t("marketplace")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00C896] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/partners"
            className="text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 relative group"
          >
            {t("partners")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00C896] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 relative group"
          >
            {t("howItWorks")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00C896] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/about-us"
            className="text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 relative group"
          >
            {t("about")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00C896] transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="hidden md:flex gap-4 items-center">
          <LanguageSwitcher />
          {isLoading ? (
            <div className="animate-pulse flex items-center gap-2">
              <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 text-sm text-gray-700 glass-card px-4 py-2 rounded-xl">
                <div className="w-8 h-8 rounded-full eco-gradient flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">
                  {t("welcome")}, {derivedName}
                </span>
              </div>
              <div className="relative group">
                <Button className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl px-6 py-2 font-medium transition-all duration-300 hover:scale-105 interactive-press">
                  {t("myEcoHub")} ▼
                </Button>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 hidden group-hover:block z-50">
                  <Link
                    href="/my/organization"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00C896] first:rounded-t-xl transition-colors"
                  >
                    {t("myOrganization")}
                  </Link>
                  <Link
                    href="/my/saved-listings"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00C896] transition-colors"
                  >
                    {t("savedListings")}
                  </Link>
                  <Link
                    href={userRole === "Admin" ? "/admin" : "/my/listings"}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00C896] transition-colors"
                    prefetch={false}
                  >
                    {userRole === "Admin" ? t("administration") : t("myListings")}
                  </Link>
                  <Link
                    href="/marketplace/add"
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00C896] transition-colors"
                  >
                    {t("createListing")}
                  </Link>
                  <div className="border-t border-gray-200"></div>
                  <SignOutButton
                    variant="ghost"
                    className="w-full text-left rounded-none last:rounded-b-xl px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                  >
                    {t("signOut")}
                  </SignOutButton>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Button
                asChild
                className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl px-6 py-2 font-medium transition-all duration-300 hover:scale-105"
              >
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button
                className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl px-6 py-2 font-medium transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/register">{t("getStarted")}</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-3 hover:bg-gray-100 rounded-xl transition-colors duration-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-20 left-4 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 md:hidden max-h-[60vh] overflow-y-auto">
            <nav className="p-4 space-y-1">
              <Link
                href="/marketplace"
                className="block text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 py-3 px-4 rounded-xl hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("marketplace")}
              </Link>
              <Link
                href="/partners"
                className="block text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 py-3 px-4 rounded-xl hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("partners")}
              </Link>
              <Link
                href="/how-it-works"
                className="block text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 py-3 px-4 rounded-xl hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("howItWorks")}
              </Link>
              <Link
                href="/about-us"
                className="block text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 py-3 px-4 rounded-xl hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("about")}
              </Link>

              <div className="pt-2 border-t border-gray-200">
                <LanguageSwitcher />
              </div>

              <div className="flex flex-col gap-2 pt-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 bg-gray-200 rounded-lg"></div>
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <div className="text-sm text-gray-700 py-2 px-3 bg-gray-50 rounded-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t("welcome")}, {derivedName}
                    </div>
                    <Button
                      className="w-full h-8 eco-gradient text-white rounded-lg font-medium text-sm interactive-press"
                      asChild
                    >
                      <Link href="/my" onClick={() => setIsMenuOpen(false)}>
                        {t("myOrganization")}
                      </Link>
                    </Button>
                    <Button
                      className="w-full h-8 eco-gradient text-white rounded-lg font-medium text-sm interactive-press"
                      asChild
                    >
                      <Link href="/my/saved-listings" onClick={() => setIsMenuOpen(false)}>
                        {t("savedListings")}
                      </Link>
                    </Button>
                    <Button
                      className="w-full h-8 eco-gradient text-white rounded-lg font-medium text-sm interactive-press"
                      asChild
                    >
                      <Link href="/my/listings" onClick={() => setIsMenuOpen(false)}>
                        {t("myListings")}
                      </Link>
                    </Button>
                    {userRole === "Admin" && (
                      <Button
                        className="w-full h-8 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm interactive-press"
                        asChild
                      >
                        <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                          {t("administration")}
                        </Link>
                      </Button>
                    )}
                    <Button
                      className="w-full h-8 eco-gradient text-white rounded-lg font-medium text-sm interactive-press"
                      asChild
                    >
                      <Link href="/marketplace/add" onClick={() => setIsMenuOpen(false)}>
                        {t("createListing")}
                      </Link>
                    </Button>
                    <SignOutButton
                      variant="outline"
                      className="w-full h-8 rounded-lg text-red-600 border-red-200 hover:bg-red-50 bg-transparent text-sm"
                      onBeforeSignOut={() => setIsMenuOpen(false)}
                    >
                      {t("signOut")}
                    </SignOutButton>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full h-8 eco-gradient text-white rounded-lg font-medium text-sm interactive-press"
                      asChild
                    >
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        {t("signIn")}
                      </Link>
                    </Button>
                    <Button
                      className="w-full h-8 eco-gradient text-white rounded-lg font-medium text-sm interactive-press"
                      asChild
                    >
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                        {t("getStarted")}
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
