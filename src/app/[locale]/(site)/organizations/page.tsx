import { Suspense } from "react"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, MapPin, Users } from "lucide-react"
import { getLocale } from "next-intl/server"
import OrganizationsClientPage from "./organizations-client-page"
import { fetchPublicOrganizations } from "@/services/public/organizations"
import { SectionIcon, SectionCard, sectionColors } from "@/components/ui/section-indicators"

interface OrganizationsPageProps {
  searchParams: Promise<{
    search?: string
    type?: string
  }>
}

export default async function OrganizationsPage({ searchParams }: OrganizationsPageProps) {
  const locale = await getLocale()
  const params = await searchParams

  const { data: organizations, error } = await fetchPublicOrganizations({
    search: params.search,
    type: params.type,
  })

  const initialOrganizations = organizations ?? []
  const initialSearch = params.search ?? ""
  const initialType = params.type ?? "all"
  const organizationTypes = Array.from(new Set(initialOrganizations.map((org) => org.type))).sort()
  const colors = sectionColors.organizations

  if (error) {
    console.error("Error fetching organizations:", error)
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container px-4 md:px-6">
        {/* Header with blue section accent */}
        <div className="text-center mb-12 animate-fade-in relative">
          {/* Section accent line */}
          <div
            className={`mx-auto w-20 h-1 rounded-full bg-gradient-to-r ${colors.gradient} mb-6`}
          />

          <div
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold mb-6 transition-all duration-300 hover:scale-105 ${colors.bg} ${colors.border} border`}
          >
            <Building className={`w-4 h-4 mr-2 ${colors.icon}`} />
            <span className={colors.text}>Partnerët Tanë</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Organizata{" "}
            <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
              Partnere
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Zbulo organizatat që janë pjesë e rrjetit tonë të ekonomisë qarkore në Kosovë
          </p>
        </div>

        {/* Stats with blue accent borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <SectionCard section="organizations">
            <CardContent className="pt-6 text-center">
              <div
                className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${colors.light}`}
              >
                <Building className={`h-6 w-6 ${colors.icon}`} />
              </div>
              <div className={`text-3xl font-bold ${colors.text}`}>
                {initialOrganizations.length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Organizata Aktive</p>
            </CardContent>
          </SectionCard>

          <SectionCard section="organizations">
            <CardContent className="pt-6 text-center">
              <div
                className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${colors.light}`}
              >
                <Users className={`h-6 w-6 ${colors.icon}`} />
              </div>
              <div className={`text-3xl font-bold ${colors.text}`}>{organizationTypes.length}</div>
              <p className="text-sm text-gray-600 mt-1">Lloje Organizatesh</p>
            </CardContent>
          </SectionCard>

          <SectionCard section="organizations">
            <CardContent className="pt-6 text-center">
              <div
                className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${colors.light}`}
              >
                <MapPin className={`h-6 w-6 ${colors.icon}`} />
              </div>
              <div className={`text-3xl font-bold ${colors.text}`}>
                {Array.from(new Set(initialOrganizations.map((org) => org.location))).length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Qytete të Mbuluara</p>
            </CardContent>
          </SectionCard>
        </div>

        {/* Client Component for Search/Filter */}
        <OrganizationsClientPage
          initialOrganizations={initialOrganizations}
          initialSearch={initialSearch}
          initialType={initialType}
          organizationTypes={organizationTypes}
          locale={locale}
        />
      </div>
    </div>
  )
}
