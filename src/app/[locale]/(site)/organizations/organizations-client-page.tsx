"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, MapPin, Users, Search, Filter, Mail, ExternalLink } from "lucide-react"
import type { PublicOrganization } from "@/services/public/organizations"

interface OrganizationsClientPageProps {
  initialOrganizations: PublicOrganization[]
  initialSearch: string
  initialType: string
  organizationTypes: string[]
  locale: string
}

export default function OrganizationsClientPage({
  initialOrganizations,
  initialSearch,
  initialType,
  organizationTypes,
  locale,
}: OrganizationsClientPageProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [type, setType] = useState(initialType)

  const filteredOrganizations = useMemo(() => {
    return initialOrganizations.filter((org) => {
      const matchesSearch = !search ||
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.description.toLowerCase().includes(search.toLowerCase()) ||
        org.primary_interest.toLowerCase().includes(search.toLowerCase())

      const matchesType = type === "all" || org.type === type

      return matchesSearch && matchesType
    })
  }, [initialOrganizations, search, type])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search.trim()) params.set("search", search.trim())
    if (type !== "all") params.set("type", type)

    const query = params.toString()
    router.push(`/${locale}/organizations${query ? `?${query}` : ""}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <>
      {/* Search and Filter */}
      <div className="mb-8">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Kërko organizata..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Lloji i organizatës" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Të gjitha llojet</SelectItem>
                  {organizationTypes.map((orgType) => (
                    <SelectItem key={orgType} value={orgType}>
                      {orgType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} className="eco-gradient">
                Kërko
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Grid */}
      {filteredOrganizations.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Nuk u gjetën organizata
          </h3>
          <p className="text-gray-500">
            Provoni të ndryshoni kriteret e kërkimit
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="glass-card hover-lift group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {org.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        {org.type}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {org.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{org.contact_person}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{org.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-4 w-4" />
                    <span>{org.primary_interest}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
                    asChild
                  >
                    <Link href={`mailto:${org.contact_email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Kontakto
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Back to Home */}
      <div className="text-center mt-12">
        <Button variant="outline" asChild>
          <Link href={`/${locale}`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Kthehu në fillim
          </Link>
        </Button>
      </div>
    </>
  )
}