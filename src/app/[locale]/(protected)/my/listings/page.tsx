import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link, redirect } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { getServerUser } from "@/lib/supabase/server"
import { fetchUserListings } from "@/services/listings"
import { Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MyListingsTable } from "./my-listings-table"

export default async function MyListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "DashboardV2" })

  const { user } = await getServerUser()
  if (!user?.id) {
    redirect({ href: "/login?message=Please login to view your listings", locale })
    return null
  }

  const { data: userListings } = await fetchUserListings(user.id)
  const successMessage =
    typeof resolvedSearchParams?.message === "string"
      ? decodeURIComponent(resolvedSearchParams.message)
      : undefined

  const tableLabels = {
    searchPlaceholder: t("myListingsPage.table.searchPlaceholder"),
    emptyTitle: t("myListingsPage.empty.title"),
    emptyBody: t("myListingsPage.empty.description"),
    emptyCta: t("myListingsPage.empty.cta"),
    tabs: {
      active: t("myListingsPage.table.tabs.active"),
      draft: t("myListingsPage.table.tabs.draft"),
      archived: t("myListingsPage.table.tabs.archived"),
    },
    columns: {
      title: t("myListingsPage.table.columns.title"),
      status: t("myListingsPage.table.columns.status"),
      visibility: t("myListingsPage.table.columns.visibility"),
      updated: t("myListingsPage.table.columns.updated"),
      price: t("myListingsPage.table.columns.price"),
      actions: t("myListingsPage.table.columns.actions"),
    },
    statuses: {
      active: t("myListingsPage.table.statuses.active"),
      draft: t("myListingsPage.table.statuses.draft"),
      archived: t("myListingsPage.table.statuses.archived"),
    },
    visibilities: {
      public: t("myListingsPage.table.visibilities.public"),
      private: t("myListingsPage.table.visibilities.private"),
    },
    actions: {
      view: t("myListingsPage.table.actions.view"),
      edit: t("myListingsPage.table.actions.edit"),
      archive: t("myListingsPage.table.actions.archive"),
    },
    archive: {
      title: t("myListingsPage.table.archive.title"),
      description: t("myListingsPage.table.archive.description"),
      confirm: t("myListingsPage.table.archive.confirm"),
      cancel: t("myListingsPage.table.archive.cancel"),
      success: t("myListingsPage.table.archive.success"),
      error: t("myListingsPage.table.archive.error"),
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">{t("myListingsPage.label")}</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t("myListingsPage.title")}
          </h1>
          <p className="text-sm text-gray-600">{t("myListingsPage.subtitle")}</p>
        </div>
        <Button asChild className="eco-gradient shadow-sm gap-2">
          <Link href="/marketplace/add">
            <Plus className="h-4 w-4" />
            {t("myListingsPage.createNew")}
          </Link>
        </Button>
      </div>

      {successMessage ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <AlertTitle>{t("myListingsPage.successTitle")}</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <MyListingsTable listings={userListings} locale={locale} labels={tableLabels} />
    </div>
  )
}
