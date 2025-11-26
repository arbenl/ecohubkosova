import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User, FileText, Building2, Heart } from "lucide-react"
import { DashboardSkeleton } from "./components/DashboardSkeleton"

export default async function MyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations("my-workspace")

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("sections.profile")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{t("profile.description")}</p>
              <Button
                asChild
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <Link href={`/${locale}/my/profile`}>{t("profile.edit")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("sections.listings")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{t("listings.description")}</p>
              <Button
                asChild
                variant="outline"
                className="rounded-full border border-emerald-200 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <Link href={`/${locale}/my/saved-listings`}>{t("listings.view")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t("sections.organization")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{t("organization.description")}</p>
              <Button
                asChild
                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <Link href={`/${locale}/my/organization`}>{t("organization.manage")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                {t("sections.partners")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{t("partners.description")}</p>
              <Button
                asChild
                variant="outline"
                className="rounded-full border border-emerald-200 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <Link href={`/${locale}/partners`}>{t("partners.explore")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Suspense>
    </div>
  )
}
