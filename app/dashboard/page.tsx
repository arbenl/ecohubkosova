"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, ShoppingCart, ArrowRight, User, TrendingUp, Building } from "lucide-react"
import { useAuth, useSupabase } from "@/lib/auth-provider"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user, userProfile } = useAuth()
  const supabase = useSupabase()
  const [stats, setStats] = useState({
    organizationsCount: 0,
    articlesCount: 0,
    usersCount: 0,
    listingsCount: 0,
  })
  const [latestArticles, setLatestArticles] = useState([])
  const [keyPartners, setKeyPartners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Get stats
        const [
          { count: organizationsCount },
          { count: articlesCount },
          { count: usersCount },
          { count: listingsCount },
        ] = await Promise.all([
          supabase.from("organizations").select("*", { count: "exact", head: true }).eq("eshte_aprovuar", true),
          supabase.from("artikuj").select("*", { count: "exact", head: true }).eq("eshte_publikuar", true),
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("tregu_listime").select("*", { count: "exact", head: true }).eq("eshte_aprovuar", true),
        ])

        // Get latest articles
        const { data: articles } = await supabase
          .from("artikuj")
          .select("*, users(emri_i_plotë)")
          .eq("eshte_publikuar", true)
          .order("created_at", { ascending: false })
          .limit(3)

        // Get key partners
        const { data: partners } = await supabase
          .from("organizations")
          .select("*")
          .eq("eshte_aprovuar", true)
          .order("created_at", { ascending: false })
          .limit(5)

        setStats({
          organizationsCount: organizationsCount || 0,
          articlesCount: articlesCount || 0,
          usersCount: usersCount || 0,
          listingsCount: listingsCount || 0,
        })
        setLatestArticles(articles || [])
        setKeyPartners(partners || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  if (!user) {
    return null
  }

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Mirë se erdhe, {userProfile?.emri_i_plotë || "Përdorues"}!
          </h1>
          <p className="text-gray-600 mt-1">Ky është paneli juaj i kontrollit në ECO HUB KOSOVA</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-xl">
            <Link href="/profili">
              <User className="h-4 w-4 mr-2" />
              Profili im
            </Link>
          </Button>
          <Button
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl"
            size="sm"
            asChild
          >
            <Link href="/tregu">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Eksploro Tregun
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Organizata</CardTitle>
            <Building className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.organizationsCount}</div>
            <p className="text-xs text-gray-500 mt-1">Të aprovuara</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Artikuj</CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.articlesCount}</div>
            <p className="text-xs text-gray-500 mt-1">Të publikuar</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Anëtarë</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.usersCount}</div>
            <p className="text-xs text-gray-500 mt-1">Të regjistruar</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Listime</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.listingsCount}</div>
            <p className="text-xs text-gray-500 mt-1">Në treg</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Articles */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-gray-900">Artikujt e fundit</CardTitle>
            <CardDescription>Artikujt më të fundit nga Qendra e Dijes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestArticles && latestArticles.length > 0 ? (
              <>
                {latestArticles.map((article) => (
                  <div key={article.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{article.titulli}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Nga: {article.users?.emri_i_plotë || "Autor i panjohur"}
                    </p>
                    <div className="flex justify-end mt-2">
                      <Button variant="ghost" size="sm" className="text-emerald-600 rounded-lg" asChild>
                        <Link href={`/qendra-e-dijes/${article.id}`}>
                          Lexo <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full rounded-xl" asChild>
                    <Link href="/qendra-e-dijes">Shiko të gjithë artikujt</Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">Nuk ka artikuj të disponueshëm aktualisht.</p>
            )}
          </CardContent>
        </Card>

        {/* Key Partners */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-gray-900">Partnerët kryesorë</CardTitle>
            <CardDescription>Organizatat aktive në rrjetin tonë</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {keyPartners && keyPartners.length > 0 ? (
              <>
                {keyPartners.map((partner) => (
                  <div key={partner.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{partner.emri}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {partner.lloji} • {partner.vendndodhja}
                    </p>
                    <div className="flex justify-end mt-2">
                      <Button variant="ghost" size="sm" className="text-emerald-600 rounded-lg" asChild>
                        <Link href={`/drejtoria/${partner.id}`}>
                          Shiko <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full rounded-xl" asChild>
                    <Link href="/drejtoria">Shiko të gjithë partnerët</Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">Nuk ka partnerë të disponueshëm aktualisht.</p>
            )}
          </CardContent>
        </Card>
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
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 rounded-xl hover-lift"
              asChild
            >
              <Link href="/tregu/shto">
                <ShoppingCart className="h-8 w-8 text-emerald-600" />
                <span className="text-sm font-medium text-center">Shto listim në treg</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 rounded-xl hover-lift"
              asChild
            >
              <Link href="/drejtoria">
                <Users className="h-8 w-8 text-emerald-600" />
                <span className="text-sm font-medium text-center">Eksploro partnerët</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 rounded-xl hover-lift"
              asChild
            >
              <Link href="/qendra-e-dijes">
                <BookOpen className="h-8 w-8 text-emerald-600" />
                <span className="text-sm font-medium text-center">Qendra e dijes</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 rounded-xl hover-lift"
              asChild
            >
              <Link href="/profili">
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
