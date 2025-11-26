export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getTranslations, getLocale } from "next-intl/server"
import { getServerUser } from "@/lib/supabase/server"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { UserProfileEditForm } from "./user-profile-edit-form"
import { getProfileData } from "@/app/[locale]/(protected)/profile/actions"

export default async function MyProfileEditPage() {
  const locale = await getLocale()
  const t = await getTranslations("my-profile")
  const tCommon = await getTranslations("common")

  const { user } = await getServerUser()

  if (!user?.id) {
    redirect(`/${locale}/login?message=${encodeURIComponent(tCommon("loginRequired"))}`)
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
