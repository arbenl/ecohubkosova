"use client"

import { useEffect, useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, MapPin, Search, Users } from "lucide-react"

interface Organization {
  id: string
  emri: string
  pershkrimi: string
  interesi_primar: string
  vendndodhja: string
  lloji: string
  created_at: string
}

interface DrejtoriaClientPageProps {
  initialOrganizations: Organization[]
  hasMoreInitial: boolean
  initialSearchQuery: string
  initialSelectedType: string
  initialSelectedInterest: string
  initialPage: number
  organizationTypes: string[]
  interests: string[]
}

export default function DrejtoriaClientPage({
  initialOrganizations,
  hasMoreInitial,
  initialSearchQuery,
  initialSelectedType,
  initialSelectedInterest,
  initialPage,
  organizationTypes,
  interests,
}: DrejtoriaClientPageProps) {
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [selectedType, setSelectedType] = useState(initialSelectedType)
  const [selectedInterest, setSelectedInterest] = useState(initialSelectedInterest)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSearchQuery(initialSearchQuery)
  }, [initialSearchQuery])

  useEffect(() => {
    setSelectedType(initialSelectedType)
  }, [initialSelectedType])

  useEffect(() => {
    setSelectedInterest(initialSelectedInterest)
  }, [initialSelectedInterest])

  const buildQuery = ({
    search,
    type,
    interest,
    page,
  }: {
    search: string
    type: string
    interest: string
    page: number
  }) => {
    const params = new URLSearchParams()

    if (search.trim()) {
      params.set("search", search.trim())
    }

    if (type !== "all") {
      params.set("type", type)
    }

    if (interest !== "all") {
      params.set("interest", interest)
    }

    if (page > 1) {
      params.set("page", String(page))
    }

    return params.toString()
  }

  const applyFilters = (overrides?: { page?: number; type?: string; interest?: string; search?: string }) => {
    const query = buildQuery({
      search: overrides?.search ?? searchQuery,
      type: overrides?.type ?? selectedType,
      interest: overrides?.interest ?? selectedInterest,
      page: overrides?.page ?? 1,
    })
    startTransition(() => {
      router.push(query ? `?${query}` : "?")
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    applyFilters({ page: 1, search: searchQuery })
  }

  const handleLoadPage = (page: number) => {
    applyFilters({ page })
  }

  return (
    <>
      <form className="flex flex-col md:flex-row gap-4 mb-8" onSubmit={handleSubmit}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Kërko organizata..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedType}
          onValueChange={(value) => {
            setSelectedType(value)
            applyFilters({ page: 1, type: value })
          }}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Lloji i organizatës" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha llojet</SelectItem>
            {organizationTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedInterest}
          onValueChange={(value) => {
            setSelectedInterest(value)
            applyFilters({ page: 1, interest: value })
          }}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Interesi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha interesat</SelectItem>
            {interests.map((interest) => (
              <SelectItem key={interest} value={interest}>
                {interest}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isPending} className="md:w-[150px]">
          {isPending ? "Duke filtruar..." : "Kërko"}
        </Button>
      </form>

      {initialOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialOrganizations.map((org) => (
            <Card key={org.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      org.lloji === "OJQ"
                        ? "bg-blue-100 text-blue-800"
                        : org.lloji === "Ndërmarrje Sociale"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {org.lloji}
                  </span>
                </div>
                <CardTitle className="text-lg">{org.emri}</CardTitle>
                <CardDescription className="line-clamp-2">{org.pershkrimi}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{org.vendndodhja}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>Interesi primar: {org.interesi_primar}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between items-center border-t">
                <Button size="sm" asChild>
                  <Link href={`/drejtoria/${org.id}`}>Shiko profilin</Link>
                </Button>
                <Button size="sm" variant="outline">
                  Shpreh interes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Nuk u gjetën organizata</h3>
          <p className="text-gray-500 mt-1">Provoni të ndryshoni filtrat ose të kontrolloni më vonë.</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-10">
        <Button
          variant="outline"
          disabled={initialPage <= 1 || isPending}
          onClick={() => handleLoadPage(Math.max(1, initialPage - 1))}
        >
          Më parë
        </Button>

        <div className="text-sm text-gray-500">
          Faqja {initialPage}
          {isPending && <span className="ml-2 italic">Duke u ngarkuar...</span>}
        </div>

        <Button variant="outline" disabled={!hasMoreInitial || isPending} onClick={() => handleLoadPage(initialPage + 1)}>
          Më pas
        </Button>
      </div>
    </>
  )
}
