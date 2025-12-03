import { Suspense } from "react"
import { getTranslations, getLocale, setRequestLocale } from "next-intl/server"
import { Heart, Briefcase, User, LayoutGrid, Bell, ArrowUpRight, ShoppingCart } from "lucide-react"
import { Link } from "@/i18n/routing"
import { getUserStats } from "./actions"
import type { UserStats } from "./actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getServerUser } from "@/lib/supabase/server"

export default async function MyDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "DashboardV2" })
  const { user } = await getServerUser()

  return (
    <div className="space-y-12">
      <div
        data-testid="dashboardv2-hero"
        className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-6 md:p-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-gray-600">
          {t("subtitle", { name: user?.email?.split("@")[0] || "User" })}
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent locale={locale} t={t} />
      </Suspense>
    </div>
  )
}

async function DashboardContent({ locale, t }: { locale: string; t: any }) {
  const defaultStats: UserStats = {
    savedListings: 0,
    organizations: 0,
    myListings: 0,
  }

  const { data, error } = await getUserStats()
  const stats = data ?? defaultStats

  if (error) {
    console.error("Error fetching user stats:", error)
  }

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">{t("stats.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            data-testid="dashboardv2-stat-saved"
            title={t("stats.savedListings")}
            value={stats.savedListings}
            icon={<Heart className="h-5 w-5 text-emerald-600" />}
            href={`/my/saved-listings`}
            t={t}
          />
          <StatCard
            data-testid="dashboardv2-stat-orgs"
            title={t("stats.organizations")}
            value={stats.organizations}
            icon={<Briefcase className="h-5 w-5 text-emerald-600" />}
            href={`/my/organization`}
            t={t}
          />
          <StatCard
            data-testid="dashboardv2-stat-listings"
            title={t("stats.myListings")}
            value={stats.myListings}
            icon={<ShoppingCart className="h-5 w-5 text-emerald-600" />}
            href={`/my/listings`}
            t={t}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
          {t("quickActions.title")}
        </h2>
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          data-testid="dashboardv2-quickactions"
        >
          <QuickActionCard
            href={`/my/profile`}
            icon={<User className="h-8 w-8 text-emerald-600" />}
            title={t("quickActions.profile.title")}
            description={t("quickActions.profile.description")}
          />
          <QuickActionCard
            href={`/my/organization`}
            icon={<Briefcase className="h-8 w-8 text-emerald-600" />}
            title={t("quickActions.organization.title")}
            description={t("quickActions.organization.description")}
          />
          <QuickActionCard
            href={`/marketplace/add`}
            icon={<LayoutGrid className="h-8 w-8 text-emerald-600" />}
            title={t("quickActions.addListing.title")}
            description={t("quickActions.addListing.description")}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">
          {t("alerts.title")}
        </h2>
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center justify-center text-center">
            <div className="space-y-2">
              <Bell className="h-8 w-8 text-gray-400 mx-auto" />
              <p className="text-sm font-medium text-gray-700">{t("alerts.noNewAlerts")}</p>
              <p className="text-xs text-gray-500">{t("alerts.description")}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  href,
  "data-testid": dataTestId,
  t,
}: {
  title: string
  value: number
  icon: React.ReactNode
  href: string
  "data-testid"?: string
  t: any
}) {
  return (
    <Card
      className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 group"
      data-testid={dataTestId}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-5">
        <div>
          <CardTitle className="text-base font-semibold text-gray-800 group-hover:text-emerald-900 transition-colors">
            {title}
          </CardTitle>
        </div>
        <div className="p-2 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="text-3xl font-bold text-gray-900 group-hover:text-emerald-900 transition-colors">
          {value}
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 group-hover:underline font-medium mt-2"
          data-testid={`${dataTestId}-link`}
        >
          {t("stats.viewDetails")}
          <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </CardContent>
    </Card>
  )
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link href={href} className="block group">
      <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 h-full hover:-translate-y-1">
        <CardContent className="p-6 text-center">
          <div className="mb-4 inline-block p-3 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
            {icon}
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-emerald-900 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-12">
      <section>
        <div className="h-8 w-48 bg-gray-200 rounded-md mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl h-36 bg-gray-100 animate-pulse" />
          <Card className="rounded-2xl h-36 bg-gray-100 animate-pulse" />
          <Card className="rounded-2xl h-36 bg-gray-100 animate-pulse" />
        </div>
      </section>
      <section>
        <div className="h-8 w-48 bg-gray-200 rounded-md mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl h-48 bg-gray-100 animate-pulse" />
          <Card className="rounded-2xl h-48 bg-gray-100 animate-pulse" />
          <Card className="rounded-2xl h-48 bg-gray-100 animate-pulse" />
        </div>
      </section>
    </div>
  )
}
