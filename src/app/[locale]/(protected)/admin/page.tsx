import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Building,
  ShoppingCart,
  Shield,
  UserCheck,
  ArrowUpRight,
  CheckIcon,
} from "lucide-react"
import { revalidatePath } from "next/cache"
import { Link } from "@/i18n/routing"
import { getAdminStats } from "./actions"
import type { AdminStats } from "@/services/admin/stats"
import { AdminDashboardSkeleton } from "./components/AdminDashboardSkeleton"
import { AdminDashboardHeader } from "./components/AdminDashboardHeader"
import { AdminActivitySection } from "./components/AdminActivitySection"
import { AdminPending } from "./components/AdminPending"
import { AdminQuickActions } from "./components/AdminQuickActions"
import { fetchPendingOrganizations } from "@/services/admin/organizations"
import {
  fetchPendingAdminListings,
  approveListingRecord,
  rejectListingRecord,
} from "@/services/admin/listings"

async function approveListingAction(formData: FormData) {
  "use server"

  const listingId = formData.get("id")
  if (typeof listingId !== "string" || !listingId) return

  const { error } = await approveListingRecord(listingId)
  if (error) {
    console.error("[admin] Failed to approve listing", error)
    return
  }

  revalidatePath("/admin")
  revalidatePath("/admin/listings")
}

async function rejectListingAction(formData: FormData) {
  "use server"

  const listingId = formData.get("id")
  if (typeof listingId !== "string" || !listingId) return

  const { error } = await rejectListingRecord(listingId)
  if (error) {
    console.error("[admin] Failed to reject listing", error)
    return
  }

  revalidatePath("/admin")
  revalidatePath("/admin/listings")
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "admin-workspace" })

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <AdminDashboardHeader locale={locale} />

      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboardContent locale={locale} t={t} />
      </Suspense>
    </div>
  )
}

async function AdminDashboardContent({ locale, t }: { locale: string; t: any }) {
  const defaultStats: AdminStats = {
    users: 0,
    organizations: 0,
    pendingOrganizations: 0,
    articles: 0, // Keeping these to satisfy type interface if shared, but setting to 0
    pendingArticles: 0,
    listings: 0,
    pendingListings: 0,
  }

  const { data, error } = await getAdminStats()
  const stats = data ?? defaultStats

  if (error) {
    console.error("Error fetching admin stats:", error)
  }

  const pendingOrgsResult = await fetchPendingOrganizations(5)
  const pendingListings = await fetchPendingAdminListings(5)

  return (
    <div className="space-y-8">
      {/* Statistics Overview */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-6">
          {t("stats.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 group cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-5 md:p-6">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-emerald-900 transition-colors">
                  {t("stats.users")}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {t("stats.usersDescription")}
                </CardDescription>
              </div>
              <div className="p-2 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6 pt-0">
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-emerald-900 transition-colors">
                {stats.users.toLocaleString()}
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href="/admin/users"
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 focus:text-emerald-700 focus:outline-none group-hover:underline font-medium"
                  aria-label={t("stats.usersAriaLabel")}
                >
                  {t("stats.viewDetails")}
                  <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 group cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-5 md:p-6">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-emerald-900 transition-colors">
                  {t("stats.organizations")}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {t("stats.organizationsDescription")}
                </CardDescription>
              </div>
              <div className="p-2 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                <Building className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6 pt-0">
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-emerald-900 transition-colors">
                {stats.organizations.toLocaleString()}
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href="/admin/organizations"
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 focus:text-emerald-700 focus:outline-none group-hover:underline font-medium"
                  aria-label={t("stats.organizationsAriaLabel")}
                >
                  {t("stats.viewDetails")}
                  <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                {stats.pendingOrganizations > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {stats.pendingOrganizations} {t("stats.pending")}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 group cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-5 md:p-6">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-emerald-900 transition-colors">
                  {t("stats.listings")}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {t("stats.listingsDescription")}
                </CardDescription>
              </div>
              <div className="p-2 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                <ShoppingCart className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6 pt-0">
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-emerald-900 transition-colors">
                {stats.listings.toLocaleString()}
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href="/admin/listings"
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 focus:text-emerald-700 focus:outline-none group-hover:underline font-medium"
                  aria-label={t("stats.listingsAriaLabel")}
                >
                  {t("stats.viewDetails")}
                  <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                {stats.pendingListings > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {stats.pendingListings} {t("stats.pending")}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-6">
          {t("quickActions.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 group cursor-pointer">
            <Link
              href="/admin/users"
              className="block p-6 focus:outline-none h-full"
              aria-label={t("quickActions.usersAriaLabel")}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="p-3 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors mb-4">
                  <Users className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-emerald-900 transition-colors">
                  {t("quickActions.users")}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("quickActions.usersDescription")}
                </p>
              </div>
            </Link>
          </Card>

          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 group cursor-pointer">
            <Link
              href="/admin/organizations"
              className="block p-6 focus:outline-none h-full"
              aria-label={t("quickActions.organizationsAriaLabel")}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="p-3 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors mb-4">
                  <Building className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-emerald-900 transition-colors">
                  {t("quickActions.organizations")}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("quickActions.organizationsDescription")}
                </p>
              </div>
            </Link>
          </Card>

          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 group cursor-pointer">
            <Link
              href="admin/organization-members"
              className="block p-6 focus:outline-none h-full"
              aria-label={t("quickActions.membersAriaLabel")}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="p-3 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors mb-4">
                  <UserCheck className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-emerald-900 transition-colors">
                  {t("quickActions.members")}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("quickActions.membersDescription")}
                </p>
              </div>
            </Link>
          </Card>

          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 group cursor-pointer">
            <Link
              href="/admin/audits"
              className="block p-6 focus:outline-none h-full"
              aria-label={t("quickActions.auditsAriaLabel")}
            >
              <div className="flex flex-col items-center text-center h-full">
                <div className="p-3 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors mb-4">
                  {/* Replaced FileText with Shield or similar if FileText was only for Articles/Audits - actually Audits is FileText usually */}
                  <Shield className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-emerald-900 transition-colors">
                  {t("quickActions.audits")}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t("quickActions.auditsDescription")}
                </p>
              </div>
            </Link>
          </Card>
        </div>
      </section>

      <AdminPending
        cards={[
          {
            title: t("stats.organizationsPending"),
            count: stats.pendingOrganizations,
            href: "/admin/organizations",
            icon: <UserCheck className="h-5 w-5 text-emerald-600" />,
          },
          {
            title: t("stats.listingsPending"),
            count: stats.pendingListings,
            href: "/admin/listings",
            icon: <ShoppingCart className="h-5 w-5 text-emerald-600" />,
          },
        ]}
        locale={locale}
      />

      {pendingOrgsResult.data && pendingOrgsResult.data.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{t("pendingSection.orgsTitle")}</h2>
            <Link
              href="/admin/organizations"
              className="text-sm text-emerald-700 hover:text-emerald-800"
              prefetch={false}
            >
              {t("stats.viewDetails")}
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
              {pendingOrgsResult.data.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-semibold text-gray-900">{org.name}</div>
                    <div className="text-sm text-gray-600">{org.contact_email}</div>
                  </div>
                  <Link
                    href={`/admin/organizations`}
                    className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                    prefetch={false}
                  >
                    {t("pendingSection.review")}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">{t("pendingSection.orgsTitle")}</h2>
          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <CardContent className="p-5 text-sm text-gray-600">
              {t("pendingSection.empty")}
            </CardContent>
          </Card>
        </section>
      )}

      <PendingList
        title={t("pendingSection.listingsTitle")}
        emptyLabel={t("pendingSection.emptyListings")}
        href="/admin/listings"
        approveLabel={t("pendingSection.approve")}
        rejectLabel={t("pendingSection.reject")}
        rows={(pendingListings.data ?? []).map((listing) => ({
          id: listing.id,
          title: listing.title,
          meta: listing.category,
          createdAt: listing.created_at,
        }))}
        reviewLabel={t("pendingSection.review")}
        onApprove={approveListingAction}
        onReject={rejectListingAction}
      />

      <AdminQuickActions locale={locale} />

      <AdminActivitySection />
    </div>
  )
}

type PendingListRow = {
  id: string
  title: string
  meta?: string | null
  createdAt?: string | null
}

function PendingList({
  title,
  emptyLabel,
  rows,
  href,
  approveLabel,
  rejectLabel,
  reviewLabel,
  onApprove,
  onReject,
}: {
  title: string
  emptyLabel: string
  rows: PendingListRow[]
  href?: string
  approveLabel: string
  rejectLabel: string
  reviewLabel?: string
  onApprove?: (formData: FormData) => Promise<void>
  onReject?: (formData: FormData) => Promise<void>
}) {
  const hasRows = rows.length > 0
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="text-sm text-emerald-700 hover:text-emerald-800"
            prefetch={false}
          >
            {reviewLabel}
          </Link>
        ) : null}
      </div>

      {hasRows ? (
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold text-gray-900">{row.title}</div>
                  <div className="text-sm text-gray-600">
                    {[row.meta, row.createdAt ? new Date(row.createdAt).toLocaleDateString() : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {href ? (
                    <Link
                      href={href}
                      className="text-sm text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                      prefetch={false}
                    >
                      <span>{reviewLabel}</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  ) : null}
                  {onReject ? (
                    <form action={onReject}>
                      <input type="hidden" name="id" value={row.id} />
                      <Button type="submit" variant="outline" size="sm">
                        <Shield className="h-4 w-4" />
                        {rejectLabel}
                      </Button>
                    </form>
                  ) : null}
                  {onApprove ? (
                    <form action={onApprove}>
                      <input type="hidden" name="id" value={row.id} />
                      <Button type="submit" size="sm">
                        <CheckIcon />
                        {approveLabel}
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <CardContent className="p-5 text-sm text-gray-600">{emptyLabel}</CardContent>
        </Card>
      )}
    </section>
  )
}
