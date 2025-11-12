import { createServerSupabaseClient } from "@/lib/supabase/server"
import OrganizationsClientPage from "./organizations-client-page" // Will create this client component later

interface Organization {
  id: string
  emri: string
  pershkrimi: string
  interesi_primar: string
  person_kontakti: string
  email_kontakti: string
  vendndodhja: string
  lloji: string
  eshte_aprovuar: boolean
  created_at: string
  updated_at: string | null
}

export default async function OrganizationsPage() {
  const supabase = createServerSupabaseClient()

  let initialOrganizations: Organization[] = []
  let error: string | null = null

  try {
    const { data, error: fetchError } = await supabase.from("organizations").select("*")
    if (fetchError) {
      throw fetchError
    }
    initialOrganizations = data || []
  } catch (err: any) {
    console.error("Error fetching organizations:", err)
    error = "Gabim gjatë marrjes së organizatave."
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
      <h1 className="text-3xl font-semibold mb-6">Organizatat</h1>
      <OrganizationsClientPage initialOrganizations={initialOrganizations} />
    </div>
  )
}
