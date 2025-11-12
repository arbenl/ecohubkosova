import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Search, MapPin, Users } from "lucide-react"
import DrejtoriaClientPage from "./drejtoria-client-page" // Will create this client component later
import { getOrganizationsData } from "./actions"

interface DrejtoriaPageProps {
  searchParams: {
    search?: string
    type?: string
    interest?: string
    page?: string
  }
}

export default async function DrejtoriaPage({ searchParams }: DrejtoriaPageProps) {
  const { initialOrganizations, hasMoreInitial, error } = await getOrganizationsData(searchParams)

  const initialSearchQuery = searchParams.search || ""
  const initialSelectedType = searchParams.type || "all"
  const initialSelectedInterest = searchParams.interest || "all"

  // TODO: Handle the error state in the UI
  if (error) {
    console.error("Error in DrejtoriaPage:", error)
  }

  const organizationTypes = ["OJQ", "Ndërmarrje Sociale", "Kompani"]

  const interests = [
    "Riciklim",
    "Energji e ripërtëritshme",
    "Bujqësi e qëndrueshme",
    "Ekonomi qarkulluese",
    "Menaxhim i mbetjeve",
    "Prodhim i qëndrueshëm",
    "Tekstil",
    "Ndërtim i qëndrueshëm",
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Drejtoria e Organizatave</h1>
              <p className="text-gray-600 mt-1">
                Zbulo dhe lidhu me organizatat aktive në rrjetin e ekonomisë qarkulluese
              </p>
            </div>
          </div>

          <DrejtoriaClientPage
            initialOrganizations={initialOrganizations}
            hasMoreInitial={hasMoreInitial}
            initialSearchQuery={initialSearchQuery}
            initialSelectedType={initialSelectedType}
            initialSelectedInterest={initialSelectedInterest}
            organizationTypes={organizationTypes}
            interests={interests}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
