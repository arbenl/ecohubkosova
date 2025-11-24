import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, BookOpen, ShoppingCart, TrendingUp } from "lucide-react"
import { getAdminStats } from "./actions"
import type { AdminStats } from "@/services/admin/stats"
import AdminStatCard from "./admin-stat-card" // Will create this client component later
import AdminQuickActionCard from "./admin-quick-action-card" // Will create this client component later

import { getTranslations } from "next-intl/server"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"

export default async function AdminDashboardPage({
  params,
}: {
  params: { locale: string }
}) {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: "admin-workspace" })

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
    <WorkspaceLayout
      title={t("title")}
      subtitle={t("subtitle")}
      badge="Admin"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          title={t("stats.users")}
          value={stats.users}
          description={t("stats.usersDescription")}
          icon={<Users className="h-5 w-5 text-emerald-600" />}
          href={`/${locale}/admin/users`}
        />

        <AdminStatCard
          title={t("stats.organizations")}
          value={stats.organizations}
          description={t("stats.organizationsDescription")}
          icon={<Building className="h-5 w-5 text-emerald-600" />}
          href={`/${locale}/admin/organizations`}
          pendingCount={stats.pendingOrganizations}
          pendingMessage={t("stats.organizationsPending")}
        />

        <AdminStatCard
          title={t("stats.articles")}
          value={stats.articles}
          description={t("stats.articlesDescription")}
          icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
          href={`/${locale}/admin/articles`}
          pendingCount={stats.pendingArticles}
          pendingMessage={t("stats.articlesPending")}
        />

        <AdminStatCard
          title={t("stats.listings")}
          value={stats.listings}
          description={t("stats.listingsDescription")}
          icon={<ShoppingCart className="h-5 w-5 text-emerald-600" />}
          href={`/${locale}/admin/listings`}
          pendingCount={stats.pendingListings}
          pendingMessage={t("stats.listingsPending")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-emerald-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              {t("quickActions.title")}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">{t("quickActions.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <AdminQuickActionCard
                title={t("quickActions.users")}
                icon={<Users className="h-8 w-8 text-emerald-600 mb-2" />}
                href={`/${locale}/admin/users`}
              />
              <AdminQuickActionCard
                title={t("quickActions.organizations")}
                icon={<Building className="h-8 w-8 text-emerald-600 mb-2" />}
                href={`/${locale}/admin/organizations`}
              />
              <AdminQuickActionCard
                title={t("quickActions.articles")}
                icon={<BookOpen className="h-8 w-8 text-emerald-600 mb-2" />}
                href={`/${locale}/admin/articles`}
              />
              <AdminQuickActionCard
                title={t("quickActions.listings")}
                icon={<ShoppingCart className="h-8 w-8 text-emerald-600 mb-2" />}
                href={`/${locale}/admin/listings`}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">{t("activity.title")}</CardTitle>
            <CardDescription className="text-sm text-gray-600">{t("activity.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-sm text-gray-500">
              {t("activity.placeholder")}
            </div>
          </CardContent>
        </Card>
      </div>
    </WorkspaceLayout>
  )
}
