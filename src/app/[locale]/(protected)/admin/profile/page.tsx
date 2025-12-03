export const dynamic = "force-dynamic"

import { redirect } from "@/i18n/routing"
import { getTranslations, getLocale } from "next-intl/server"
import { getServerUser } from "@/lib/supabase/server"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { AdminProfileEditForm } from "./admin-profile-edit-form"
import { getProfileData } from "@/app/[locale]/(protected)/profile/actions"

export default async function AdminProfileEditPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations("admin-profile")
  const tCommon = await getTranslations("common")

  const { user } = await getServerUser()

  if (!user?.id) {
    redirect({
      href: `/login?message=${encodeURIComponent(tCommon("loginRequired"))}`,
      locale: locale,
    })
    return // Add return here
  }

  const { userProfile, error } = await getProfileData()

  // Handle case where userProfile is null
  if (!userProfile) {
    // Redirect to login if userProfile is null
    redirect({
      href: `/login?message=${encodeURIComponent(tCommon("loginRequired"))}`,
      locale: locale,
    })
    return // Add return here
  }

  // Handle case where userProfile exists but is not an Admin
  if (userProfile.role !== "Admin") {
    redirect({ href: "/my", locale: locale })
    return // Add return here
  }

  // At this point, userProfile is guaranteed to be non-null and role is Admin
  // No need for a separate `adminProfile` variable, as `userProfile` is now safely narrowed.

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
