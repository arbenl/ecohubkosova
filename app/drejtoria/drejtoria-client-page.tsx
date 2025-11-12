"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClientSupabaseClient } from "@/lib/supabase" // Use client-side supabase client
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Search, MapPin, Users } from "lucide-react"

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
  organizationTypes: string[]
  interests: string[]
}

export default function DrejtoriaClientPage({
  initialOrganizations,
  hasMoreInitial,
  initialSearchQuery,
  initialSelectedType,
  initialSelectedInterest,
  organizationTypes,
  interests,
}: DrejtoriaClientPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [selectedType, setSelectedType] = useState(initialSelectedType)
  const [selectedInterest, setSelectedInterest] = useState(initialSelectedInterest)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(hasMoreInitial)
  const itemsPerPage = 9

  const supabase = createClientSupabaseClient()

  const fetchOrganizations = useCallback(
    async ({ reset = false, pageToLoad }: { reset?: boolean; pageToLoad?: number } = {}) => {
      const targetPage = reset ? 1 : pageToLoad ?? 1
      const normalizedType = selectedType === "all" ? "" : selectedType
      const normalizedInterest = selectedInterest === "all" ? "" : selectedInterest

      if (reset) {
        setPage(1)
        setOrganizations([])
      }

      setLoading(true)

      try {
        const from = (targetPage - 1) * itemsPerPage
        const to = targetPage * itemsPerPage - 1

        let query = supabase
          .from("organizations")
          .select("*")
          .eq("eshte_aprovuar", true)
          .order("created_at", { ascending: false })
          .range(from, to)

        if (searchQuery) {
          query = query.or(`emri.ilike.%${searchQuery}%,pershkrimi.ilike.%${searchQuery}%`)
        }

        if (normalizedType) {
          query = query.eq("lloji", normalizedType)
        }

        if (normalizedInterest) {
          query = query.ilike("interesi_primar", `%${normalizedInterest}%`)
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        if (data) {
          setOrganizations((prev) => (reset ? data : [...prev, ...data]))
          setHasMore(data.length === itemsPerPage)
        }
      } catch (error) {
        console.error("Error fetching organizations:", error)
      } finally {
        setLoading(false)
      }
    },
    [itemsPerPage, searchQuery, selectedInterest, selectedType, supabase]
  )

  useEffect(() => {
    // Only fetch if not initial load or if filters have changed from initial
    if (
      searchQuery !== initialSearchQuery ||
      selectedType !== initialSelectedType ||
      selectedInterest !== initialSelectedInterest
    ) {
      fetchOrganizations({ reset: true })
    }
  }, [searchQuery, selectedType, selectedInterest, fetchOrganizations, initialSearchQuery, initialSelectedType, initialSelectedInterest])

  const handleLoadMore = () => {
    if (loading || !hasMore) {
      return
    }

    setPage((prev) => {
      const nextPage = prev + 1
      fetchOrganizations({ pageToLoad: nextPage })
      return nextPage
    })
  }

  // Update URL search params for persistence
  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (searchQuery) {
      current.set("search", searchQuery);
    } else {
      current.delete("search");
    }
    if (selectedType !== "all") {
      current.set("type", selectedType);
    } else {
      current.delete("type");
    }
    if (selectedInterest !== "all") {
      current.set("interest", selectedInterest);
    } else {
      current.delete("interest");
    }
    router.push(`?${current.toString()}`);
  }, [searchQuery, selectedType, selectedInterest, router, searchParams]);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Kërko organizata..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
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
        <Select value={selectedInterest} onValueChange={setSelectedInterest}>
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
      </div>

      {organizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
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
          {loading ? (
            <p>Duke ngarkuar...</p>
          ) : (
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Nuk u gjetën organizata</h3>
              <p className="text-gray-500 mt-1">Provoni të ndryshoni filtrat ose të kontrolloni më vonë</p>
            </div>
          )}
        </div>
      )}

      {hasMore && organizations.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
            {loading ? "Duke ngarkuar..." : "Ngarko më shumë"}
          </Button>
        </div>
      )}
    </>
  )
}