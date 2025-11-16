"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"

export function EksploroCTA() {
  const { user, isLoading, userProfile } = useAuth()
  const isAuthenticated = Boolean(user?.id)

  // Debug logging
  if (typeof window !== "undefined") {
    console.log("[EksploroCTA Debug]", {
      isAuthenticated,
      isLoading,
      userId: user?.id || "none",
      userEmail: user?.email || "none",
    })
  }

  // Don't show anything while loading to prevent flash of wrong content
  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <div className="h-14 w-48 bg-gray-200 animate-pulse rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-center">
      {isAuthenticated ? (
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
        >
          <Link href="/dashboard">
            <ArrowRight className="mr-2 h-5 w-5" />
            Shko në Dashboard
          </Link>
        </Button>
      ) : (
        <>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            <Link href="/register">
              <Users className="mr-2 h-5 w-5" />
              Regjistrohu Tani
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-2xl px-8 py-4 text-lg font-semibold border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 hover:scale-105 bg-transparent"
          >
            <Link href="/login">
              <ArrowRight className="mr-2 h-5 w-5" />
              Kyçu
            </Link>
          </Button>
        </>
      )}
    </div>
  )
}
