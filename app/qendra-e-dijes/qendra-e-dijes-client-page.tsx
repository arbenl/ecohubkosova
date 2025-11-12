"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClientSupabaseClient } from "@/lib/supabase" // Use client-side supabase client
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
  [key: string]: unknown
}

interface QendraEDijesClientPageProps {
  initialArticles: Article[]
  hasMoreInitial: boolean
  initialSearchQuery: string
  initialSelectedCategory: string
  categories: string[]
}

export default function QendraEDijesClientPage({
  initialArticles,
  hasMoreInitial,
  initialSearchQuery,
  initialSelectedCategory,
  categories,
}: QendraEDijesClientPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialSelectedCategory)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(hasMoreInitial)
  const itemsPerPage = 9

  const supabase = createClientSupabaseClient()

  const fetchArticles = useCallback(
    async ({ reset = false, pageToLoad = 1 }: { reset?: boolean; pageToLoad?: number } = {}) => {
      const targetPage = reset ? 1 : pageToLoad
      const normalizedCategory = selectedCategory === "all" ? "" : selectedCategory

      if (reset) {
        setPage(1)
        setArticles([])
      }

      setLoading(true)

      try {
        const from = (targetPage - 1) * itemsPerPage
        const to = targetPage * itemsPerPage - 1

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

        if (searchQuery) {
          query = query.or(`titulli.ilike.%${searchQuery}%,përmbajtja.ilike.%${searchQuery}%`)
        }

        if (normalizedCategory) {
          query = query.eq("kategori", normalizedCategory)
        }

        const { data, error } = await query

        if (error) {
          throw error
        }

        const typedData = (data ?? []) as unknown as Article[]

        if (typedData.length) {
          setArticles((prev) => (reset ? typedData : [...prev, ...typedData]))
          setHasMore(typedData.length === itemsPerPage)
        } else {
          if (reset) {
            setArticles([])
          }
          setHasMore(false)
        }
      } catch (error) {
        console.error("Error fetching articles:", error)
      } finally {
        setLoading(false)
      }
    },
    [itemsPerPage, searchQuery, selectedCategory, supabase]
  )

  useEffect(() => {
    // Only fetch if not initial load or if filters have changed from initial
    if (
      searchQuery !== initialSearchQuery ||
      selectedCategory !== initialSelectedCategory
    ) {
      fetchArticles({ reset: true })
    }
  }, [searchQuery, selectedCategory, fetchArticles, initialSearchQuery, initialSelectedCategory])

  const handleLoadMore = () => {
    if (loading || !hasMore) {
      return
    }

    setPage((prev) => {
      const nextPage = prev + 1
      fetchArticles({ pageToLoad: nextPage })
      return nextPage
    })
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

  // Update URL search params for persistence
  useEffect(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (searchQuery) {
      current.set("search", searchQuery);
    } else {
      current.delete("search");
    }
    if (selectedCategory !== "all") {
      current.set("category", selectedCategory);
    } else {
      current.delete("category");
    }
    router.push(`?${current.toString()}`);
  }, [searchQuery, selectedCategory, router, searchParams]);


  return (
    <>
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
            <SelectItem value="all">Të gjitha kategoritë</SelectItem>
            {categories.filter(Boolean).map((category) => (
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
    </>
  )
}