import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Calendar, User } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import QendraEDijesClientPage from "./qendra-e-dijes-client-page" // Will create this client component later

interface Article {
  id: string
  titulli: string
  përmbajtja: string
  kategori: string
  tags: string[]
  created_at: string
  users: {
    emri_i_plotë: string
  }
  [key: string]: unknown
}

interface QendraEDijesPageProps {
  searchParams: {
    search?: string
    category?: string
    page?: string
  }
}

export default async function QendraEDijesPage({ searchParams }: QendraEDijesPageProps) {
  const supabase = createServerSupabaseClient()

  const initialSearchQuery = searchParams.search || ""
  const initialSelectedCategory = searchParams.category || "all"
  const initialPage = parseInt(searchParams.page || "1")
  const itemsPerPage = 9

  let initialArticles: Article[] = []
  let hasMoreInitial = false

  try {
    const from = (initialPage - 1) * itemsPerPage
    const to = initialPage * itemsPerPage - 1

    let query = supabase
      .from("artikuj")
      .select(
        `
        *,
        users (emri_i_plotë)
      `
      )
      .eq("eshte_publikuar", true)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (initialSearchQuery) {
      query = query.or(`titulli.ilike.%${initialSearchQuery}%,përmbajtja.ilike.%${initialSearchQuery}%`)
    }

    if (initialSelectedCategory && initialSelectedCategory !== "all") {
      query = query.eq("kategori", initialSelectedCategory)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    initialArticles = (data ?? []) as unknown as Article[]
    hasMoreInitial = initialArticles.length === itemsPerPage
  } catch (error) {
    console.error("Error fetching initial articles:", error)
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
