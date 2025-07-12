"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, BookOpen, ShoppingCart, AlertCircle, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    organizations: 0,
    pendingOrganizations: 0,
    articles: 0,
    pendingArticles: 0,
    listings: 0,
    pendingListings: 0,
  })
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)

      try {
        // Get users count
        const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })

        // Get organizations count
        const { count: organizationsCount } = await supabase
          .from("organizations")
          .select("*", { count: "exact", head: true })

        // Get pending organizations count
        const { count: pendingOrganizationsCount } = await supabase
          .from("organizations")
          .select("*", { count: "exact", head: true })
          .eq("eshte_aprovuar", false)

        // Get articles count
        const { count: articlesCount } = await supabase.from("artikuj").select("*", { count: "exact", head: true })

        // Get pending articles count
        const { count: pendingArticlesCount } = await supabase
          .from("artikuj")
          .select("*", { count: "exact", head: true })
          .eq("eshte_publikuar", false)

        // Get listings count
        const { count: listingsCount } = await supabase
          .from("tregu_listime")
          .select("*", { count: "exact", head: true })

        // Get pending listings count
        const { count: pendingListingsCount } = await supabase
          .from("tregu_listime")
          .select("*", { count: "exact", head: true })
          .eq("eshte_aprovuar", false)

        setStats({
          users: usersCount || 0,
          organizations: organizationsCount || 0,
          pendingOrganizations: pendingOrganizationsCount || 0,
          articles: articlesCount || 0,
          pendingArticles: pendingArticlesCount || 0,
          listings: listingsCount || 0,
          pendingListings: pendingListingsCount || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Paneli i Administrimit</h1>
        <p className="text-gray-600">Mirë se vini në panelin e administrimit të ECO HUB KOSOVA</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card hover-lift cursor-pointer" onClick={() => router.push("/admin/users")}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Përdorues</CardTitle>
                <Users className="h-5 w-5 text-[#00C896]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.users}</div>
                <p className="text-xs text-gray-500 mt-1">Përdorues të regjistruar në platformë</p>
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift cursor-pointer" onClick={() => router.push("/admin/organizations")}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Organizata</CardTitle>
                <Building className="h-5 w-5 text-[#00C896]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.organizations}</div>
                <p className="text-xs text-gray-500 mt-1">Organizata të regjistruara në platformë</p>
                {stats.pendingOrganizations > 0 && (
                  <div className="mt-2 flex items-center text-amber-600 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {stats.pendingOrganizations} në pritje të aprovimit
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift cursor-pointer" onClick={() => router.push("/admin/articles")}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Artikuj</CardTitle>
                <BookOpen className="h-5 w-5 text-[#00C896]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.articles}</div>
                <p className="text-xs text-gray-500 mt-1">Artikuj në platformë</p>
                {stats.pendingArticles > 0 && (
                  <div className="mt-2 flex items-center text-amber-600 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {stats.pendingArticles} në pritje të publikimit
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card hover-lift cursor-pointer" onClick={() => router.push("/admin/listings")}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Listime në Treg</CardTitle>
                <ShoppingCart className="h-5 w-5 text-[#00C896]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.listings}</div>
                <p className="text-xs text-gray-500 mt-1">Listime në tregun e platformës</p>
                {stats.pendingListings > 0 && (
                  <div className="mt-2 flex items-center text-amber-600 text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {stats.pendingListings} në pritje të aprovimit
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <TrendingUp className="h-5 w-5 text-[#00C896]" />
                  Veprime të shpejta
                </CardTitle>
                <CardDescription>Veprime të shpejta për administrimin e platformës</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300 hover-lift border-gray-200"
                    onClick={() => router.push("/admin/users")}
                  >
                    <div className="flex flex-col items-center text-center">
                      <Users className="h-8 w-8 text-[#00C896] mb-2" />
                      <h3 className="font-medium text-gray-900">Menaxho Përdoruesit</h3>
                    </div>
                  </Card>
                  <Card
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300 hover-lift border-gray-200"
                    onClick={() => router.push("/admin/organizations")}
                  >
                    <div className="flex flex-col items-center text-center">
                      <Building className="h-8 w-8 text-[#00C896] mb-2" />
                      <h3 className="font-medium text-gray-900">Aprovo Organizatat</h3>
                    </div>
                  </Card>
                  <Card
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300 hover-lift border-gray-200"
                    onClick={() => router.push("/admin/articles")}
                  >
                    <div className="flex flex-col items-center text-center">
                      <BookOpen className="h-8 w-8 text-[#00C896] mb-2" />
                      <h3 className="font-medium text-gray-900">Publiko Artikuj</h3>
                    </div>
                  </Card>
                  <Card
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300 hover-lift border-gray-200"
                    onClick={() => router.push("/admin/listings")}
                  >
                    <div className="flex flex-col items-center text-center">
                      <ShoppingCart className="h-8 w-8 text-[#00C896] mb-2" />
                      <h3 className="font-medium text-gray-900">Aprovo Listime</h3>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-gray-900">Aktiviteti i fundit</CardTitle>
                <CardDescription>Aktiviteti i fundit në platformë</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-[#00C896] rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Organizatë e re e regjistruar</p>
                      <p className="text-xs text-gray-500">Para 2 orësh</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-[#00A07E] rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Artikull i ri i publikuar</p>
                      <p className="text-xs text-gray-500">Para 4 orësh</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-[#00C896] rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Listim i ri në treg</p>
                      <p className="text-xs text-gray-500">Para 6 orësh</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
