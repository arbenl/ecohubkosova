export const dynamic = "force-dynamic"

import { redirect } from "@/i18n/routing"
import { getTranslations, getLocale, setRequestLocale } from "next-intl/server"
import { getServerUser } from "@/lib/supabase/server"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { UserProfileEditForm } from "./user-profile-edit-form"
import { getProfileData } from "@/app/[locale]/(protected)/profile/actions"

export default async function MyProfileEditPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "my-profile" })
  const tCommon = await getTranslations({ locale, namespace: "common" })

  const { user } = await getServerUser()

  if (!user?.id) {
    redirect({ href: `/login?message=${encodeURIComponent(tCommon("loginRequired"))}`, locale })
    return null
  }

  const { userProfile, error } = await getProfileData()

  if (!userProfile) {
    return (
      <WorkspaceLayout badge={t("title")} title={t("errorTitle")} subtitle="">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="text-red-800">{error || tCommon("error")}</p>
        </div>
      </WorkspaceLayout>
    )
  }

  return (
    <WorkspaceLayout badge={t("title")} title={t("subtitle")} subtitle={t("description")}>
      <div className="max-w-2xl">
        <UserProfileEditForm
          userId={userProfile.id}
          initialFullName={userProfile.full_name}
          initialLocation={userProfile.location}
          locale={locale}
        />
      </div>
    </WorkspaceLayout>
  )
}
