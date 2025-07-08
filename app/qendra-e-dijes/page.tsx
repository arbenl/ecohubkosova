"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Calendar, User } from "lucide-react"

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
}

export default function QendraEDijesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all") // Updated default value to "all"
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const itemsPerPage = 9

  const supabase = createClientComponentClient()

  const fetchArticles = async (reset = false) => {
    if (reset) {
      setPage(1)
      setArticles([])
    }

    setLoading(true)

    try {
      let query = supabase
        .from("artikuj")
        .select(`
          *,
          users (emri_i_plotë)
        `)
        .eq("eshte_publikuar", true)
        .order("created_at", { ascending: false })
        .range(reset ? 0 : (page - 1) * itemsPerPage, reset ? itemsPerPage - 1 : page * itemsPerPage - 1)

      if (searchQuery) {
        query = query.or(`titulli.ilike.%${searchQuery}%,përmbajtja.ilike.%${searchQuery}%`)
      }

      if (selectedCategory !== "all") {
        // Updated condition to check for "all"
        query = query.eq("kategori", selectedCategory)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      if (data) {
        if (reset) {
          setArticles(data)
        } else {
          setArticles([...articles, ...data])
        }
        setHasMore(data.length === itemsPerPage)
      }
    } catch (error) {
      console.error("Error fetching articles:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles(true)
  }, [searchQuery, selectedCategory])

  const handleLoadMore = () => {
    setPage(page + 1)
    fetchArticles()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("sq-XK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
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

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Kërko artikuj..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Kategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Të gjitha kategoritë</SelectItem> {/* Updated value to "all" */}
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {article.kategori}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{article.titulli}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <CardDescription className="line-clamp-3">{truncateText(article.përmbajtja, 150)}</CardDescription>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between items-center border-t">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{article.users?.emri_i_plotë || "Anonim"}</span>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/qendra-e-dijes/${article.id}`}>Lexo më shumë</Link>
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
                  <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">Nuk u gjetën artikuj</h3>
                  <p className="text-gray-500 mt-1">Provoni të ndryshoni filtrat ose të kontrolloni më vonë</p>
                </div>
              )}
            </div>
          )}

          {hasMore && articles.length > 0 && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                {loading ? "Duke ngarkuar..." : "Ngarko më shumë"}
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
