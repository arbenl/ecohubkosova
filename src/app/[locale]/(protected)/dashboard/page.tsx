import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
import { isUserOrgMember } from "@/services/organization-onboarding"
import { eq } from "drizzle-orm"

interface PageProps {
  params: { locale: string }
}

export default async function DashboardRedirectPage({ params }: PageProps) {
  const { locale: localeParam } = params
  const locale = localeParam || "sq"
  const supabase = await createServerSupabaseClient()
  const tCommon = await getTranslations({ locale, namespace: "common" })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    redirect(`/${locale}/login?message=${encodeURIComponent(tCommon("loginRequired"))}`)
  }

  let role: string | null = null
  try {
    const result = await db
      .get()
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)
    role = result[0]?.role ?? null
  } catch (error) {
    console.error("[dashboard redirect] failed to load user role", error)
  }

  let hasOrg = false
  try {
    hasOrg = await isUserOrgMember(user.id)
  } catch (error) {
    console.error("[dashboard redirect] failed to check organization membership", error)
  }

  const destination =
    role === "Admin"
      ? `/${locale}/admin`
      : hasOrg
        ? `/${locale}/my/organization`
        : `/${locale}/my`

  redirect(destination)
}
