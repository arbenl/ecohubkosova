import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { fetchUserOrganizations } from "@/services/organization-onboarding"
import type { Metadata } from "next"
import MyOrganizationClient from "./my-organization-client"
import { db } from "@/lib/drizzle"
import { ecoListings, ecoOrganizations } from "@/db/schema/marketplace-v2"
import { eq, desc, count } from "drizzle-orm"

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

  const listingCounts: Record<string, number> = {}
  const listingSummaries: Record<
    string,
    { id: string; title: string; status: string | null; city: string | null }[]
  > = {}

  for (const org of organizations) {
    const countResult = await db
      .get()
      .select({ value: count() })
      .from(ecoListings)
      .leftJoin(ecoOrganizations, eq(ecoListings.organization_id, ecoOrganizations.id))
      .where(eq(ecoOrganizations.organization_id, org.id))

    listingCounts[org.id] = countResult[0]?.value ?? 0

    const listings = await db
      .get()
      .select({
        id: ecoListings.id,
        title: ecoListings.title,
        status: ecoListings.status,
        city: ecoListings.city,
      })
      .from(ecoListings)
      .leftJoin(ecoOrganizations, eq(ecoListings.organization_id, ecoOrganizations.id))
      .where(eq(ecoOrganizations.organization_id, org.id))
      .orderBy(desc(ecoListings.created_at))
      .limit(5)

    listingSummaries[org.id] = listings.map((l) => ({
      id: l.id,
      title: l.title,
      status: l.status,
      city: l.city,
    }))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <MyOrganizationClient
        locale={params.locale}
        initialOrganizations={organizations}
        userId={user.id}
        error={error}
        listingCounts={listingCounts}
        listingSummaries={listingSummaries}
      />
    </div>
  )
}
