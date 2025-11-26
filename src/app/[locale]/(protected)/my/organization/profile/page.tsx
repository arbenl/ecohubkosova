export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getTranslations, getLocale } from "next-intl/server"
import { getServerUser } from "@/lib/supabase/server"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { OrganizationProfileEditForm } from "./organization-profile-edit-form"
import { fetchUserOrganizations } from "@/services/organization-onboarding"

export default async function MyOrganizationProfileEditPage() {
  const locale = await getLocale()
  const t = await getTranslations("my-organization-profile")
  const tCommon = await getTranslations("common")

  const { user } = await getServerUser()

  if (!user?.id) {
    redirect(`/${locale}/login?message=${encodeURIComponent(tCommon("loginRequired"))}`)
  }

  const { data: organizations, error } = await fetchUserOrganizations(user.id)
  const primaryOrg = organizations[0]

  if (!primaryOrg) {
    return (
      <WorkspaceLayout badge={t("title")} title={t("errorTitle")} subtitle="">
        <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-6">
          <p className="text-yellow-800">{t("noOrganization")}</p>
        </div>
      </WorkspaceLayout>
    )
  }

  if (error) {
    return (
      <WorkspaceLayout badge={t("title")} title={t("errorTitle")} subtitle="">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="text-red-800">{error}</p>
        </div>
      </WorkspaceLayout>
    )
  }

  // Check if user has permission to edit (admin or editor role)
  const canEdit = ["admin", "editor"].includes(primaryOrg.role_in_organization.toLowerCase())

  if (!canEdit) {
    return (
      <WorkspaceLayout badge={t("title")} title={t("errorTitle")} subtitle="">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="text-red-800">{t("noPermission")}</p>
        </div>
      </WorkspaceLayout>
    )
  }

  return (
    <WorkspaceLayout badge={t("title")} title={t("subtitle")} subtitle={t("description")}>
      <div className="max-w-2xl">
        <OrganizationProfileEditForm
          organizationId={primaryOrg.id}
          initialData={{
            name: primaryOrg.name,
            description: primaryOrg.description,
            primary_interest: primaryOrg.primary_interest,
            contact_person: primaryOrg.contact_person,
            contact_email: primaryOrg.contact_email,
            location: primaryOrg.location,
          }}
          locale={locale}
        />
      </div>
    </WorkspaceLayout>
  )
}
