import { getOrganizations } from "./actions"
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
  const { data, error } = await getOrganizations()
  const initialOrganizations: Organization[] = data ?? []

  if (error) {
    console.error("Error fetching organizations:", error)
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
