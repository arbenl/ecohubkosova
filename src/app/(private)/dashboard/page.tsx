import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, ShoppingCart, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getServerUser } from "@/lib/supabase/server"
import { StatsCards } from "./stats-cards"
import { LatestArticles } from "./latest-articles"
import { KeyPartners } from "./key-partners"
import { DashboardChart } from "./dashboard-chart"
import { StatsCardsSkeleton } from "@/components/dashboard/stats-cards-skeleton"
import { LatestArticlesSkeleton } from "@/components/dashboard/latest-articles-skeleton"
import { KeyPartnersSkeleton } from "@/components/dashboard/key-partners-skeleton"
import { ChartSkeleton } from "@/components/dashboard/chart-skeleton"
import { getStats, getLatestArticles, getKeyPartners } from "./actions"
import { fetchUserProfileById } from "@/services/profile"

export default async function DashboardPage() {
  const { user } = await getServerUser()

  if (!user) {
    // This should ideally be caught by middleware, but as a fallback
    return null
  }

  const { userProfile, error: profileError } = await fetchUserProfileById(user.id)

  if (profileError) {
    console.error("DashboardPage profile load error:", profileError)
  }

  const stats = await getStats()
  const chartData = [
    { name: "Organizata", total: stats.organizationsCount },
    { name: "Artikuj", total: stats.articlesCount },
    { name: "Anëtarë", total: stats.usersCount },
    { name: "Listime", total: stats.listingsCount },
  ]

  const latestArticles = await getLatestArticles()
  const keyPartners = await getKeyPartners()

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Mirë se erdhe, {userProfile?.emri_i_plote || "Përdorues"}!
          </h1>
          <p className="text-gray-600 mt-1">Ky është paneli juaj i kontrollit në ECO HUB KOSOVA</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl px-6 py-2 font-medium transition-all duration-300 hover:scale-105"
            size="sm"
            asChild
          >
            <Link href="/profile">
              <User className="h-4 w-4 mr-2" />
              Profili im
            </Link>
          </Button>
          <Button
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl"
            size="sm"
            asChild
          >
            <Link href="/marketplace">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Eksploro Tregun
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards stats={stats} />
      </Suspense>

      {/* Chart */}
      <Suspense fallback={<ChartSkeleton />}>
        <DashboardChart data={chartData} />
      </Suspense>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<LatestArticlesSkeleton />}>
          <LatestArticles latestArticles={latestArticles} />
        </Suspense>
        <Suspense fallback={<KeyPartnersSkeleton />}>
          <KeyPartners keyPartners={keyPartners} />
        </Suspense>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-gray-900">Veprime të shpejta</CardTitle>
          <CardDescription>Akseso funksionalitetet kryesore të platformës</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 rounded-xl hover-lift bg-transparent"
              asChild
            >
              <Link href="/marketplace/shto">
                <ShoppingCart className="h-8 w-8 text-emerald-600" />
                <span className="text-sm font-medium text-center">Shto listim në treg</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 rounded-xl hover-lift bg-transparent"
              asChild
            >
              <Link href="/drejtoria">
                <Users className="h-8 w-8 text-emerald-600" />
                <span className="text-sm font-medium text-center">Eksploro partnerët</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 rounded-xl hover-lift bg-transparent"
              asChild
            >
              <Link href="/qendra-e-dijes">
                <BookOpen className="h-8 w-8 text-emerald-600" />
                <span className="text-sm font-medium text-center">Qendra e dijes</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 rounded-xl hover-lift bg-transparent"
              asChild
            >
              <Link href="/profile">
                <User className="h-8 w-8 text-emerald-600" />
                <span className="text-sm font-medium text-center">Përditëso profilin</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
