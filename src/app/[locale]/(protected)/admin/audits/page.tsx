export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getTranslations, getLocale } from "next-intl/server"
import { getServerUser } from "@/lib/supabase/server"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList } from "lucide-react"

export default async function AdminAuditsPage() {
  const locale = await getLocale()
  const t = await getTranslations("admin-workspace")
  const tCommon = await getTranslations("common")

  const { user } = await getServerUser()

  if (!user?.id) {
    redirect(`/${locale}/login?message=${encodeURIComponent(tCommon("loginRequired"))}`)
  }

  return (
    <WorkspaceLayout badge="Admin" title={t("audits.title")} subtitle={t("audits.subtitle")}>
      <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <CardHeader className="p-5 md:p-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-emerald-600" />
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {t("audits.cardTitle")}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {t("audits.cardDescription")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 md:p-6 pt-0">
          <div className="text-center py-12">
            <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">{t("audits.comingSoon")}</p>
          </div>
        </CardContent>
      </Card>
    </WorkspaceLayout>
  )
}
