"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"
import { SignOutButton } from "@/components/sign-out-button"

interface HeaderClientProps {
  fallbackUserName?: string | null
  fallbackUserEmail?: string | null
}

export default function HeaderClient({ fallbackUserName, fallbackUserEmail }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, session, userProfile, isLoading } = useAuth()
  const authUser = user ?? session?.user ?? null
  const derivedName = userProfile?.emri_i_plote || authUser?.email?.split("@")[0] || fallbackUserName || fallbackUserEmail?.split("@")[0]
  const isAuthenticated = Boolean(authUser || fallbackUserEmail)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl eco-gradient flex items-center justify-center text-white font-bold text-lg">
            E
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#00C896] to-[#00A07E] bg-clip-text text-transparent">
            ECO HUB KOSOVA
          </span>
        </Link>

        <nav className="hidden md:flex gap-8">
          <Link
            href="/eksploro"
            className="text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 relative group"
          >
            Eksploro
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00C896] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            href="/partnere"
            className="text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 relative group"
          >
            Partnerët
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00C896] transition-all duration-300 group-hover:w-full"></span>
          </Link>
         
          <Link
            href="/tregu"
            className="text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 relative group"
          >
            Tregu
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00C896] transition-all duration-300 group-hover:w-full"></span>
          </Link>

           <Link
            href="/rreth-nesh"
            className="text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 relative group"
          >
            Rreth Nesh
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00C896] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          
        </nav>

        <div className="hidden md:flex gap-4 items-center">
          {isLoading && !isAuthenticated ? (
            <div className="animate-pulse flex items-center gap-2">
              <div className="h-4 w-20 bg-gray-200 rounded-lg"></div>
              <div className="text-center mt-4 text-gray-600">Duke ngarkuar...</div>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-700 glass-card px-4 py-2 rounded-xl">
                <div className="w-8 h-8 rounded-full eco-gradient flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">
                  Mirë se erdhe, {derivedName}
                </span>
              </div>
              <Button
                asChild
                className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl px-6 py-2 font-medium transition-all duration-300 hover:scale-105"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <SignOutButton
                variant="ghost"
                className="rounded-xl px-4 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
              >
                Dil
              </SignOutButton>
            </div>
          ) : (
            <>
              <Button
                asChild
                className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl px-6 py-2 font-medium transition-all duration-300 hover:scale-105"
              >
                <Link href="/auth/kycu">Kycu</Link>
              </Button>
              <Button
                className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl px-6 py-2 font-medium transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/auth/regjistrohu">Fillo Bashkëpunimin</Link>
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

      {isMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-white/95 backdrop-blur-md">
          <nav className="container px-4 py-6 space-y-4">
            <Link
              href="/eksploro"
              className="block text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 py-3 px-4 rounded-xl hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Eksploro
            </Link>
            <Link
              href="/partnere"
              className="block text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 py-3 px-4 rounded-xl hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Partnerët
            </Link>
            <Link
              href="/rreth-nesh"
              className="block text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 py-3 px-4 rounded-xl hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Rreth Nesh
            </Link>
            <Link
              href="/tregu"
              className="block text-sm font-medium text-gray-700 hover:text-[#00C896] transition-colors duration-300 py-3 px-4 rounded-xl hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Tregu
            </Link>

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
              {isLoading && !isAuthenticated ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              ) : isAuthenticated ? (
                <>
                  <div className="text-sm text-gray-700 py-3 px-4 glass-card rounded-xl">
                    Mirë se erdhe, {derivedName}
                  </div>
                  <Button className="w-full eco-gradient text-white rounded-xl font-medium" asChild>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <SignOutButton
                    variant="outline"
                    className="w-full rounded-xl text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    onBeforeSignOut={() => setIsMenuOpen(false)}
                  />
                </>
              ) : (
                <>
                  <Button className="w-full eco-gradient text-white rounded-xl font-medium" asChild>
                    <Link href="/auth/kycu" onClick={() => setIsMenuOpen(false)}>
                      Kycu
                    </Link>
                  </Button>
                  <Button className="w-full eco-gradient text-white rounded-xl font-medium" asChild>
                    <Link href="/auth/regjistrohu" onClick={() => setIsMenuOpen(false)}>
                      Fillo Bashkëpunimin
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
