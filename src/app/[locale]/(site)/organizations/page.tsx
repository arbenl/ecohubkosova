import { Suspense } from "react"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building, MapPin, Users, Search, Filter } from "lucide-react"
import { getLocale } from "next-intl/server"
import OrganizationsClientPage from "./organizations-client-page"
import { fetchPublicOrganizations } from "@/services/public/organizations"

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

  // Get unique organization types for filter
  const organizationTypes = Array.from(new Set(initialOrganizations.map((org) => org.type))).sort()

  if (error) {
    console.error("Error fetching organizations:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-16">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center rounded-full glass-card px-4 py-2 text-sm font-semibold mb-6 transition-all duration-300 hover:scale-105">
            <Building className="w-4 h-4 mr-2 text-blue-600" />
            Partnerët Tanë
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Organizata{" "}
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Partnere
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Zbulo organizatat që janë pjesë e rrjetit tonë të ekonomisë qarkulluese në Kosovë
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card text-center p-6">
            <CardContent className="pt-4">
              <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{initialOrganizations.length}</div>
              <p className="text-sm text-gray-600">Organizata Aktive</p>
            </CardContent>
          </Card>

          <Card className="glass-card text-center p-6">
            <CardContent className="pt-4">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{organizationTypes.length}</div>
              <p className="text-sm text-gray-600">Lloje Organizatesh</p>
            </CardContent>
          </Card>

          <Card className="glass-card text-center p-6">
            <CardContent className="pt-4">
              <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">
                {Array.from(new Set(initialOrganizations.map((org) => org.location))).length}
              </div>
              <p className="text-sm text-gray-600">Qytete të Mbuluara</p>
            </CardContent>
          </Card>
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
