import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { fetchUserOrganizations } from "@/services/organization-onboarding"
import type { Metadata } from "next"
import MyOrganizationClient from "./my-organization-client"

interface PageProps {
  params: { locale: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: "my-organization" })

  return {
    title: t("workspace.title"),
    description: t("onboarding.subtitle"),
  }
}

export default async function MyOrganizationPage({ params }: PageProps) {
  const supabase = await createServerSupabaseClient()
  const t = await getTranslations({ locale: params.locale, namespace: "my-organization" })
  const tCommon = await getTranslations({ locale: params.locale, namespace: "common" })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    redirect(`/${params.locale}/login?message=${encodeURIComponent(tCommon("loginRequired"))}`)
  }

  // Fetch user's organizations
  const { data: organizations, error } = await fetchUserOrganizations(user.id)

  return (
    <div className="container mx-auto py-8 px-4">
      <MyOrganizationClient
        locale={params.locale}
        initialOrganizations={organizations}
        userId={user.id}
        error={error}
      />
    </div>
  )
}
