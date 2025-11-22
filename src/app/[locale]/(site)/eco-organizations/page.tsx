import { getLocale, getTranslations } from "next-intl/server"
import { and, eq, ilike } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { ecoOrganizations, organizations } from "@/db/schema"
import EcoOrganizationsClient from "./EcoOrganizationsClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Eco Organizations Directory",
  description: "Discover recycling and waste management organizations",
}

interface SearchParams {
  role?: string
  city?: string
}

interface EcoOrgWithDetails {
  id: string
  organization_id: string
  name: string
  description: string
  location: string
  org_role: string
  waste_types_handled?: string[]
  service_areas?: string[]
  certifications?: string[]
  contact_email: string
  contact_person: string
}

async function fetchEcoOrganizations(filters: SearchParams = {}): Promise<EcoOrgWithDetails[]> {
  try {
    const conditions = [eq(organizations.is_approved, true)]

    if (filters.role && filters.role !== "all") {
      conditions.push(eq(ecoOrganizations.org_role, filters.role as any))
    }

    if (filters.city && filters.city !== "all") {
      conditions.push(ilike(organizations.location, `%${filters.city}%`))
    }

    const rows = await db
      .get()
      .select({
        id: ecoOrganizations.id,
        organization_id: ecoOrganizations.organization_id,
        name: organizations.name,
        description: organizations.description,
        location: organizations.location,
        org_role: ecoOrganizations.org_role,
        waste_types_handled: ecoOrganizations.waste_types_handled,
        service_areas: ecoOrganizations.service_areas,
        certifications: ecoOrganizations.certifications,
        contact_email: organizations.contact_email,
        contact_person: organizations.contact_person,
      })
      .from(ecoOrganizations)
      .innerJoin(organizations, eq(ecoOrganizations.organization_id, organizations.id))
      .where(and(...conditions))
      .orderBy(organizations.name)

    return rows as EcoOrgWithDetails[]
  } catch (error) {
    console.error("[eco-organizations] Failed to fetch organizations:", error)
    return []
  }
}

async function getDistinctCities(): Promise<string[]> {
  try {
    const rows = await db
      .get()
      .selectDistinct({
        city: organizations.location,
      })
      .from(organizations)
      .where(eq(organizations.is_approved, true))
      .orderBy(organizations.location)

    return rows.map((r) => r.city).filter(Boolean) as string[]
  } catch (error) {
    console.error("[eco-organizations] Failed to fetch cities:", error)
    return []
  }
}

export default async function EcoOrganizationsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const locale = await getLocale()
  const t = await getTranslations("eco-organizations")
  const params = await searchParams

  const orgs = await fetchEcoOrganizations({
    role: params?.role,
    city: params?.city,
  })

  const distinctCities = await getDistinctCities()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-2">{t("pageTitle")}</h1>
          <p className="text-lg text-green-700">{t("pageSubtitle")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <EcoOrganizationsClient
          initialOrganizations={orgs}
          initialRole={params?.role || "all"}
          initialCity={params?.city || "all"}
          availableCities={distinctCities}
          locale={locale}
        />
      </div>
    </div>
  )
}
