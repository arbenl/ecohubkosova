import { createServerSupabaseClient } from "@/lib/supabase/server"
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
  const supabase = createServerSupabaseClient()

  let initialArticles: Article[] = []
  let error: string | null = null

  try {
    const { data, error: fetchError } = await supabase.from("artikuj").select("*")
    if (fetchError) {
      throw fetchError
    }
    initialArticles = data || []
  } catch (err: any) {
    console.error("Error fetching articles:", err)
    error = "Gabim gjatë marrjes së artikujve."
  }

  if (error) {
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
