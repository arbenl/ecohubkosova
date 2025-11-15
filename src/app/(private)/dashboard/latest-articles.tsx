import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function LatestArticles({ latestArticles }: { latestArticles: any[] }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-gray-900">Artikujt e fundit</CardTitle>
        <CardDescription>Artikujt më të fundit nga Qendra e Dijes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestArticles && latestArticles.length > 0 ? (
          <>
            {latestArticles.map((article: any) => (
              <div key={article.id} className="border-b pb-4 last:border-0 last:pb-0">
                <h3 className="font-medium text-gray-900 line-clamp-2">{article.titulli}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Nga: {article.users?.emri_i_plote || "Autor i panjohur"}
                </p>
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" className="text-emerald-600 rounded-lg" asChild>
                    <Link href={`/qendra-e-dijes/${article.id}`}>
                      Lexo <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full rounded-xl bg-transparent" asChild>
                <Link href="/knowledge">Shiko të gjithë artikujt</Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">Nuk ka artikuj të disponueshëm aktualisht.</p>
        )}
      </CardContent>
    </Card>
  )
}
