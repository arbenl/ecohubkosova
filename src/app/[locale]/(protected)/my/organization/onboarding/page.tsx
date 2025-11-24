import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"

import OrganizationOnboarding from "../organization-onboarding"

interface PageProps {
  params: { locale: string }
}

export default async function OrganizationOnboardingPage({ params }: PageProps) {
  const supabase = await createServerSupabaseClient()
  const tCommon = await getTranslations({ locale: params.locale, namespace: "common" })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    redirect(`/${params.locale}/login?message=${encodeURIComponent(tCommon("loginRequired"))}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrganizationOnboarding locale={params.locale} userId={user.id} />
    </div>
  )
}
