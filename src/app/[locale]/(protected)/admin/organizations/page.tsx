import { getOrganizations } from "./actions"
import OrganizationsClientPage from "./organizations-client-page" // Will create this client component later

interface AdminOrganization {
  id: string
  name: string
  description: string
  type: string
  primary_interest: string
  contact_person: string
  contact_email: string
  location: string
  created_at: string
  is_approved: boolean
  updated_at: string | null
}

export default async function OrganizationsPage() {
  const { data, error } = await getOrganizations()
  const initialOrganizations: AdminOrganization[] = data ?? []

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
