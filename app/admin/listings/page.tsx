import { createServerSupabaseClient } from "@/lib/supabase/server"
import ListingsClientPage from "./listings-client-page" // Will create this client component later

interface Listing {
  id: string
  created_by_user_id: string
  organization_id: string | null
  titulli: string
  pershkrimi: string
  kategori: string
  çmimi: number
  njesia: string
  vendndodhja: string
  sasia: string
  lloji_listimit: string
  eshte_aprovuar: boolean
  created_at: string
  updated_at: string | null
}

export default async function ListingsPage() {
  const supabase = createServerSupabaseClient()

  let initialListings: Listing[] = []
  let error: string | null = null

  try {
    const { data, error: fetchError } = await supabase.from("tregu_listime").select("*")
    if (fetchError) {
      throw fetchError
    }
    initialListings = data || []
  } catch (err: any) {
    console.error("Error fetching listings:", err)
    error = "Gabim gjatë marrjes së listimeve."
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
      <h1 className="text-3xl font-semibold mb-5">Listimet e Tregut</h1>
      <ListingsClientPage initialListings={initialListings} />
    </div>
  )
}
