import { getOrganizationMembers } from "./actions"
import OrganizationMembersClientPage from "./organization-members-client-page" // Will create this client component later

interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  roli_ne_organizate: string
  eshte_aprovuar: boolean
  created_at: string
}

interface OrganizationMemberWithDetails extends OrganizationMember {
  organization_name?: string
  user_name?: string
  user_email?: string
}

export default async function OrganizationMembersPage() {
  const { data, error } = await getOrganizationMembers()
  const initialMembers: OrganizationMemberWithDetails[] = data ?? []

  if (error) {
    console.error("Error fetching organization members:", error)
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Anëtarët e Organizatave</h1>
      <OrganizationMembersClientPage initialMembers={initialMembers} />
    </div>
  )
}
