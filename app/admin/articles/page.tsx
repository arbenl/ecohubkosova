import { getArticles } from "./actions"
import ArticlesClientPage from "./articles-client-page" // Will create this client component later

interface Article {
  id: string
  titulli: string
  përmbajtja: string
  autori_id: string
  eshte_publikuar: boolean
  kategori: string
  tags: string[] | null
  foto_kryesore: string | null
  created_at: string
  updated_at: string | null
}

const AdminArticlesPage = async () => {
  const { data, error } = await getArticles()
  const initialArticles: Article[] = data ?? []

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
