"use client"

import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useMemo } from "react"
import { ChevronRight, Building2 } from "lucide-react"
import Link from "next/link"
import { EmptyStateBlock } from "@/components/shared/empty-state-block"

interface Organization {
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

interface EcoOrganizationsClientProps {
  initialOrganizations: Organization[]
  initialRole: string
  initialCity: string
  availableCities: string[]
  locale: string
}

const ORG_ROLES = [
  "RECYCLER",
  "COLLECTOR",
  "SERVICE_PROVIDER",
  "PRODUCER",
  "RESELLER",
  "PUBLIC_INSTITUTION",
  "NGO",
  "RESEARCH",
]

export default function EcoOrganizationsClient({
  initialOrganizations,
  initialRole,
  initialCity,
  availableCities,
  locale,
}: EcoOrganizationsClientProps) {
  const t = useTranslations("eco-organizations")
  const router = useRouter()

  const [selectedRole, setSelectedRole] = useState(initialRole)
  const [selectedCity, setSelectedCity] = useState(initialCity)

  const filteredOrganizations = useMemo(() => {
    return initialOrganizations.filter((org) => {
      const matchRole = selectedRole === "all" || org.org_role === selectedRole
      const matchCity = selectedCity === "all" || org.location.includes(selectedCity)
      return matchRole && matchCity
    })
  }, [initialOrganizations, selectedRole, selectedCity])

  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    updateUrl(role, selectedCity)
  }

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    updateUrl(selectedRole, city)
  }

  const updateUrl = (role: string, city: string) => {
    const params = new URLSearchParams()
    if (role !== "all") params.set("role", role)
    if (city !== "all") params.set("city", city)

    const query = params.toString()
    router.push(`/${locale}/eco-organizations${query ? `?${query}` : ""}`)
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t("filterRoleLabel")}
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="all">{t("allRoles")}</option>
              {ORG_ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`roleLabels.${role}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t("filterCityLabel")}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="all">{t("allCities")}</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      {filteredOrganizations.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <EcoOrganizationCard key={org.id} organization={org} t={t} locale={locale} />
          ))}
        </div>
      ) : (
        <EmptyStateBlock
          icon={Building2}
          title={t("noResults")}
          description={t("tryAdjustingFilters")}
          className="max-w-2xl mx-auto"
        />
      )}
    </div>
  )
}

interface CardProps {
  organization: Organization
  t: any
  locale: string
}

function EcoOrganizationCard({ organization, t, locale }: CardProps) {
  const city = organization.location.split(",")[0]

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
      {/* Header with Role Badge */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{organization.name}</h3>
            <p className="text-sm text-gray-600">{city}</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full whitespace-nowrap">
            {t(`roleLabels.${organization.org_role}`)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Description */}
        {organization.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{organization.description}</p>
        )}

        {/* Waste Types */}
        {organization.waste_types_handled && organization.waste_types_handled.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">{t("cardMainMaterials")}</p>
            <div className="flex flex-wrap gap-2">
              {organization.waste_types_handled.slice(0, 3).map((type) => (
                <span key={type} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {type}
                </span>
              ))}
              {organization.waste_types_handled.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{organization.waste_types_handled.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Certifications */}
        {organization.certifications && organization.certifications.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">{t("cardCertifications")}</p>
            <div className="flex flex-wrap gap-2">
              {organization.certifications.map((cert) => (
                <span
                  key={cert}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium"
                >
                  ✓ {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            {organization.contact_email && (
              <a
                href={`mailto:${organization.contact_email}`}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {organization.contact_email}
              </a>
            )}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex gap-2">
        <Link
          href={`/${locale}/eco-organizations/${organization.organization_id}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-green-300 text-green-700 rounded-md text-sm font-medium hover:bg-green-50 transition-colors"
        >
          {t("cardViewOrganization")}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
