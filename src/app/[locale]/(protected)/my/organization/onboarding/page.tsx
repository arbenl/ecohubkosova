import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"

import OrganizationOnboarding from "../organization-onboarding"

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function OrganizationOnboardingPage({ params }: PageProps) {
  const { locale } = await params
  const supabase = await createServerSupabaseClient()
  const tCommon = await getTranslations({ locale, namespace: "common" })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    redirect(`/${locale}/login?message=${encodeURIComponent(tCommon("loginRequired"))}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrganizationOnboarding locale={locale} userId={user.id} />
    </div>
  )
}
