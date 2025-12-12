/**
 * EcoHub Kosova – Account Settings Page
 * MIT License – feel free to reuse in other projects.
 * Copyright (c) 2025 Kosovo Advocacy and Development Center (KADC)
 */

export const dynamic = "force-dynamic"

import { redirect } from "@/i18n/routing"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getServerUser } from "@/lib/supabase/server"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { AccountSettingsForm } from "./account-settings-form"
import { getProfileData } from "@/app/[locale]/(protected)/profile/actions"

export default async function AccountSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "DashboardV2" })
  const tCommon = await getTranslations({ locale, namespace: "common" })

  const { user } = await getServerUser()

  if (!user?.id) {
    redirect({ href: `/login?message=${encodeURIComponent(tCommon("loginRequired"))}`, locale })
    return null
  }

  const { userProfile, error } = await getProfileData()

  if (!userProfile) {
    return (
      <WorkspaceLayout badge={t("nav.account")} title={t("account.errorTitle")} subtitle="">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="text-red-800">{error || tCommon("error")}</p>
        </div>
      </WorkspaceLayout>
    )
  }

  return (
    <WorkspaceLayout
      badge={t("nav.account")}
      title={t("account.title")}
      subtitle={t("account.subtitle")}
    >
      <div className="max-w-2xl">
        <AccountSettingsForm
          userEmail={user.email || ""}
          userId={userProfile.id}
          initialFullName={userProfile.full_name}
          initialLocation={userProfile.location}
          currentLocale={locale}
        />
      </div>
    </WorkspaceLayout>
  )
}
