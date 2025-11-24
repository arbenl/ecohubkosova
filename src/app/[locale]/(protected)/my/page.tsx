import { redirect } from "next/navigation"
import { getTranslations, getLocale } from "next-intl/server"
import Link from "next/link"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Bookmark, Building2, Bell, Sparkles } from "lucide-react"
import { getServerUser } from "@/lib/supabase/server"
import { fetchUserOrganizations } from "@/services/organization-onboarding"

export default async function MyWorkspacePage() {
  const locale = await getLocale()
  const t = await getTranslations("my-workspace")
  const tCommon = await getTranslations("common")

  const { user } = await getServerUser()

  if (!user?.id) {
    redirect(`/${locale}/login?message=${encodeURIComponent(tCommon("loginRequired"))}`)
  }

  const { data: organizations = [] } = await fetchUserOrganizations(user.id)
  const primaryOrg = organizations[0]

  return (
    <WorkspaceLayout
      badge={t("title")}
      title={t("subtitle")}
      subtitle=""
    >

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-emerald-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">{t("cards.profile.title")}</CardTitle>
            <Bell className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">{t("cards.profile.description")}</p>
            <Link
              href={`/${locale}/profile`}
              className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-800"
            >
              {t("cards.profile.cta")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">{t("cards.saved.title")}</CardTitle>
            <Bookmark className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">{t("cards.saved.description")}</p>
            <Link
              href={`/${locale}/my/saved-listings`}
              className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-800"
            >
              {t("cards.saved.cta")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {t("cards.partner.title")}
            </CardTitle>
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">{t("cards.partner.description")}</p>
            <Link
              href={`/${locale}/partners#behu-partner`}
              className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-800"
            >
              {t("cards.partner.cta")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-100 shadow-sm md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {t("cards.organization.title")}
              </CardTitle>
              <p className="text-sm text-gray-600">{t("cards.organization.description")}</p>
            </div>
            <Building2 className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {primaryOrg ? (
              <>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-gray-900">{primaryOrg.name}</p>
                  <p className="text-sm text-gray-600">{primaryOrg.primary_interest}</p>
                </div>
                <Link
                  href={`/${locale}/my/organization`}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                >
                  {t("cards.organization.ctaExisting")}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">{t("empty.noOrg")}</p>
                <Link
                  href={`/${locale}/my/organization`}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-emerald-700 hover:bg-emerald-100"
                >
                  {t("cards.organization.ctaMissing")}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </WorkspaceLayout>
  )
}
