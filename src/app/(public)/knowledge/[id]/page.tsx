import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, User, Tag } from "lucide-react"
import { fetchArticleById } from "@/services/articles"

interface ArticleDetailPageProps {
  params: {
    id: string
  }
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { data: article, error } = await fetchArticleById(params.id)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("sq-XK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (error || !article) {
    return (
      <>
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Artikulli nuk u gjet</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button asChild>
                <Link href="/knowledge">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kthehu në Qendrën e Dijes
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/knowledge">
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
                  <span>{article.users?.emri_i_plote || "Anonim"}</span>
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
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{article.permbajtja}</div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/knowledge">Shiko më shumë artikuj</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
