"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"

export function RrethNeshHeroCTA() {
  const { user } = useAuth()
  const isAuthenticated = Boolean(user)

  return isAuthenticated ? (
    <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:shadow-xl hover:shadow-emerald-400/30 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105">
      <Link href="/dashboard">
        <ArrowRight className="mr-2 h-5 w-5" />
        Shko në Dashboard
      </Link>
    </Button>
  ) : (
    <>
      <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:shadow-xl hover:shadow-emerald-400/30 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105">
        <Link href="/auth/regjistrohu">
          <Users className="mr-2 h-5 w-5" />
          Regjistrohu Tani
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className="rounded-2xl px-8 py-4 text-lg font-semibold border-2 border-gray-200 hover:border-emerald-600 hover:text-emerald-700 transition-all duration-300 hover:scale-105 bg-transparent"
      >
        <Link href="/kontakti">
          Na kontaktoni
        </Link>
      </Button>
    </>
  )
}

export function RrethNeshBottomCTA() {
  const { user } = useAuth()
  const isAuthenticated = Boolean(user)

  return isAuthenticated ? (
    <>
      <Button asChild>
        <Link href="/dashboard">
          Shko në Dashboard
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/kontakti">Na kontaktoni</Link>
      </Button>
    </>
  ) : (
    <>
      <Button asChild>
        <Link href="/auth/regjistrohu">
          Regjistrohu tani <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/kontakti">Na kontaktoni</Link>
      </Button>
    </>
  )
}
