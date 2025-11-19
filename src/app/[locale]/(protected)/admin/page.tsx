import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, BookOpen, ShoppingCart, TrendingUp } from "lucide-react"
import { getAdminStats } from "./actions"
import type { AdminStats } from "@/services/admin/stats"
import AdminStatCard from "./admin-stat-card" // Will create this client component later
import AdminQuickActionCard from "./admin-quick-action-card" // Will create this client component later

export default async function AdminDashboardPage({
  params,
}: {
  params: { locale: string }
}) {
  const { locale } = params
  const defaultStats: AdminStats = {
    users: 0,
    organizations: 0,
    pendingOrganizations: 0,
    articles: 0,
    pendingArticles: 0,
    listings: 0,
    pendingListings: 0,
  }

  const { data, error } = await getAdminStats()
  const stats = data ?? defaultStats

  if (error) {
    console.error("Error fetching admin stats:", error)
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Paneli i Administrimit</h1>
        <p className="text-gray-600">Mirë se vini në panelin e administrimit të ECO HUB KOSOVA</p>
      </div>

      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminStatCard
            title="Përdorues"
            value={stats.users}
            description="Përdorues të regjistruar në platformë"
            icon={<Users className="h-5 w-5 text-[#00C896]" />}
            href={`/${locale}/admin/users`}
          />

          <AdminStatCard
            title="Organizata"
            value={stats.organizations}
            description="Organizata të regjistruara në platformë"
            icon={<Building className="h-5 w-5 text-[#00C896]" />}
            href={`/${locale}/admin/organizations`}
            pendingCount={stats.pendingOrganizations}
            pendingMessage="në pritje të aprovimit"
          />

          <AdminStatCard
            title="Artikuj"
            value={stats.articles}
            description="Artikuj në platformë"
            icon={<BookOpen className="h-5 w-5 text-[#00C896]" />}
            href={`/${locale}/admin/articles`}
            pendingCount={stats.pendingArticles}
            pendingMessage="në pritje të publikimit"
          />

          <AdminStatCard
            title="Listime në Treg"
            value={stats.listings}
            description="Listime në tregun e platformës"
            icon={<ShoppingCart className="h-5 w-5 text-[#00C896]" />}
            href={`/${locale}/admin/listings`}
            pendingCount={stats.pendingListings}
            pendingMessage="në pritje të aprovimit"
          />
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
                <AdminQuickActionCard
                  title="Menaxho Përdoruesit"
                  icon={<Users className="h-8 w-8 text-[#00C896] mb-2" />}
                  href={`/${locale}/admin/users`}
                />
                <AdminQuickActionCard
                  title="Aprovo Organizatat"
                  icon={<Building className="h-8 w-8 text-[#00C896] mb-2" />}
                  href={`/${locale}/admin/organizations`}
                />
                <AdminQuickActionCard
                  title="Publiko Artikuj"
                  icon={<BookOpen className="h-8 w-8 text-[#00C896] mb-2" />}
                  href={`/${locale}/admin/articles`}
                />
                <AdminQuickActionCard
                  title="Aprovo Listime"
                  icon={<ShoppingCart className="h-8 w-8 text-[#00C896] mb-2" />}
                  href={`/${locale}/admin/listings`}
                />
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
    </div>
  )
}
