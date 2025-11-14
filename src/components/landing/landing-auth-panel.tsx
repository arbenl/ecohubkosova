"use client"

import Link from "next/link"
import { Loader2, UserPlus, LogIn, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-provider"
import { LandingAuthPanelSkeleton } from "./landing-auth-panel-skeleton"

export function LandingAuthPanel() {
  const { user, userProfile, isLoading } = useAuth()

  if (isLoading) {
    return <LandingAuthPanelSkeleton />
  }

  if (user) {
    return (
      <div className="glass-card rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 flex flex-col gap-4 shadow-lg">
        <div>
          <p className="text-sm font-medium text-emerald-700">I kyçur si</p>
          <p className="text-lg font-semibold text-gray-900">
            {userProfile?.emri_i_plote || user.email?.split("@")[0] || "Përdorues"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="flex-1 eco-gradient text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#00C896]/25"
          >
            <Link href="/dashboard">
              Shko te Dashboardi
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="flex-1 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold"
          >
            <Link href="/profili">Menaxho Profilin</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl border border-gray-100 bg-white/80 p-6 flex flex-col gap-4 shadow-lg">
      <div>
        <p className="text-lg font-semibold text-gray-900">Ke llogari ekzistuese?</p>
        <p className="text-sm text-gray-600">Kyçu ose krijo një llogari të re për të filluar bashkëpunimin.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          asChild
          className="flex-1 eco-gradient text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#00C896]/25"
        >
          <Link href="/auth/kycu">
            <LogIn className="mr-2 h-4 w-4" />
            Kyçu
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="flex-1 rounded-xl border-gray-200 font-semibold text-gray-800 hover:bg-gray-50"
        >
          <Link href="/auth/regjistrohu">
            <UserPlus className="mr-2 h-4 w-4" />
            Krijo llogari
          </Link>
        </Button>
      </div>
    </div>
  )
}
