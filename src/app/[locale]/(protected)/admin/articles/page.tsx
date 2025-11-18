import { getArticles } from "./actions"
import ArticlesClientPage from "./articles-client-page" // Will create this client component later
import type { AdminArticle } from "@/services/admin/articles"

const AdminArticlesPage = async () => {
  const { data, error } = await getArticles()
  const initialArticles: AdminArticle[] = data ?? []

  if (error) {
    console.error("Error fetching articles:", error)
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Artikujt</h1>
      <ArticlesClientPage initialArticles={initialArticles} />
    </div>
  )
}

export default AdminArticlesPage
