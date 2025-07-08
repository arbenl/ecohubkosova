"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useSupabase } from "@/lib/auth-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, User, Tag } from "lucide-react"

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

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useSupabase()

  useEffect(() => {
    const fetchArticle = async () => {
      if (!params.id) return

      try {
        const { data, error } = await supabase
          .from("artikuj")
          .select(`
            *,
            users (emri_i_plotë)
          `)
          .eq("id", params.id)
          .eq("eshte_publikuar", true)
          .single()

        if (error) {
          throw error
        }

        setArticle(data)
      } catch (error: any) {
        console.error("Error fetching article:", error)
        setError("Artikulli nuk u gjet ose nuk është i publikuar.")
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.id, supabase])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("sq-XK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p>Duke ngarkuar artikullin...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Artikulli nuk u gjet</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button asChild>
                <Link href="/qendra-e-dijes">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kthehu në Qendrën e Dijes
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/qendra-e-dijes">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kthehu në Qendrën e Dijes
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                  {article.kategori}
                </span>
              </div>

              <CardTitle className="text-3xl font-bold leading-tight">{article.titulli}</CardTitle>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{article.users?.emri_i_plotë || "Anonim"}</span>
                </div>
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-gray-500" />
                  {article.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{article.përmbajtja}</div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/qendra-e-dijes">Shiko më shumë artikuj</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
