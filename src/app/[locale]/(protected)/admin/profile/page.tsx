export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getTranslations, getLocale } from "next-intl/server"
import { getServerUser } from "@/lib/supabase/server"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { AdminProfileEditForm } from "./admin-profile-edit-form"
import { getProfileData } from "@/app/[locale]/(protected)/profile/actions"

export default async function AdminProfileEditPage() {
  const locale = await getLocale()
  const t = await getTranslations("admin-profile")
  const tCommon = await getTranslations("common")

  const { user } = await getServerUser()

  if (!user?.id) {
    redirect(`/${locale}/login?message=${encodeURIComponent(tCommon("loginRequired"))}`)
  }

  const { userProfile, error } = await getProfileData()

  // Check if user is admin
  if (!userProfile || userProfile.role !== "Admin") {
    redirect(`/${locale}/my`)
  }

  if (error) {
    return (
      <WorkspaceLayout badge="Admin" title={t("errorTitle")} subtitle="">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="text-red-800">{error}</p>
        </div>
      </WorkspaceLayout>
    )
  }

  return (
    <WorkspaceLayout badge="Admin" title={t("subtitle")} subtitle={t("description")}>
      <div className="max-w-2xl">
        <AdminProfileEditForm
          userId={userProfile.id}
          initialFullName={userProfile.full_name}
          initialLocation={userProfile.location}
          locale={locale}
        />
      </div>
    </WorkspaceLayout>
  )
}
