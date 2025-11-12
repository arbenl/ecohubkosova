import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Calendar, User } from "lucide-react"
import QendraEDijesClientPage from "./qendra-e-dijes-client-page" // Will create this client component later
import { getArticlesData } from "./actions"

interface QendraEDijesPageProps {
  searchParams: {
    search?: string
    category?: string
    page?: string
  }
}

export default async function QendraEDijesPage({ searchParams }: QendraEDijesPageProps) {
  const { initialArticles, hasMoreInitial, error } = await getArticlesData(searchParams)

  const initialSearchQuery = searchParams.search || ""
  const initialSelectedCategory = searchParams.category || "all"

  // TODO: Handle the error state in the UI
  if (error) {
    console.error("Error in QendraEDijesPage:", error)
  }

  const categories = [
    "Ekonomi qarkulluese",
    "Riciklim",
    "Energji e ripërtëritshme",
    "Qëndrueshmëri",
    "Inovacion",
    "Politika mjedisore",
    "Studime rasti",
    "Tjera",
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Qendra e Dijes</h1>
              <p className="text-gray-600 mt-1">Artikuj, studime dhe informacione për ekonominë qarkulluese</p>
            </div>
          </div>

          <QendraEDijesClientPage
            initialArticles={initialArticles}
            hasMoreInitial={hasMoreInitial}
            initialSearchQuery={initialSearchQuery}
            initialSelectedCategory={initialSelectedCategory}
            categories={categories}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
