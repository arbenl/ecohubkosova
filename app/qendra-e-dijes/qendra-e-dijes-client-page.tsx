"use client"

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Calendar, Search, User } from "lucide-react"
import type { ArticleRecord } from "@/src/services/articles"

interface QendraEDijesClientPageProps {
  initialArticles: ArticleRecord[]
  hasMoreInitial: boolean
  initialSearchQuery: string
  initialSelectedCategory: string
  initialPage: number
  categories: string[]
}

export default function QendraEDijesClientPage({
  initialArticles,
  hasMoreInitial,
  initialSearchQuery,
  initialSelectedCategory,
  initialPage,
  categories,
}: QendraEDijesClientPageProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialSelectedCategory)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setSearchQuery(initialSearchQuery)
  }, [initialSearchQuery])

  useEffect(() => {
    setSelectedCategory(initialSelectedCategory)
  }, [initialSelectedCategory])

  const buildQuery = (search: string, category: string, page: number) => {
    const params = new URLSearchParams()

    if (search.trim()) {
      params.set("search", search.trim())
    }

    if (category !== "all") {
      params.set("category", category)
    }

    if (page > 1) {
      params.set("page", String(page))
    }

    return params.toString()
  }

  const pushQuery = (overrides?: { search?: string; category?: string; page?: number }) => {
    const query = buildQuery(
      overrides?.search ?? searchQuery,
      overrides?.category ?? selectedCategory,
      overrides?.page ?? 1,
    )

    startTransition(() => {
      router.push(query ? `?${query}` : "?")
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    pushQuery({ page: 1, search: searchQuery })
  }

  const handlePageChange = (page: number) => {
    pushQuery({ page })
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
    return `${text.slice(0, maxLength)}...`
  }

  const visibleArticles = useMemo(() => initialArticles, [initialArticles])

  return (
    <>
      <form className="flex flex-col md:flex-row gap-4 mb-8" onSubmit={handleSubmit}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Kërko artikuj..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value)
            pushQuery({ page: 1, category: value })
          }}
        >
          <SelectTrigger className="w-full md:w-[220px]">
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
        <Button type="submit" disabled={isPending} className="md:w-[140px]">
          {isPending ? "Duke filtruar..." : "Kërko"}
        </Button>
      </form>

      {visibleArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleArticles.map((article) => (
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
                <CardDescription className="line-clamp-3">{truncateText(article.permbajtja, 180)}</CardDescription>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between items-center border-t text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(article.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {article.users?.emri_i_plote || "Anonim"}
                  </span>
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
          <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Nuk u gjetën artikuj</h3>
          <p className="text-gray-500 mt-1">Provoni të ndryshoni filtrat ose të kontrolloni më vonë.</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-10">
        <Button
          variant="outline"
          disabled={initialPage <= 1 || isPending}
          onClick={() => handlePageChange(Math.max(1, initialPage - 1))}
        >
          Më parë
        </Button>
        <div className="text-sm text-gray-500">
          Faqja {initialPage}
          {isPending && <span className="ml-2 italic">Duke u ngarkuar...</span>}
        </div>
        <Button variant="outline" disabled={!hasMoreInitial || isPending} onClick={() => handlePageChange(initialPage + 1)}>
          Më pas
        </Button>
      </div>
    </>
  )
}
