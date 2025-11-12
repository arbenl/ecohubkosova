import { createServerSupabaseClient } from "@/lib/supabase/server"
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
  const supabase = createServerSupabaseClient()

  let initialMembers: OrganizationMemberWithDetails[] = []
  let error: string | null = null

  try {
    const { data, error: fetchError } = await supabase.from("organization_members").select(`
          *,
          organizations!inner(emri),
          users!inner(emri_i_plotë, email)
        `)

    if (fetchError) {
      throw fetchError
    }

    initialMembers =
      data?.map((member: any) => ({
        ...member,
        organization_name: member.organizations?.emri,
        user_name: member.users?.emri_i_plotë,
        user_email: member.users?.email,
      })) || []
  } catch (err: any) {
    console.error("Error fetching organization members:", err)
    error = "Gabim gjatë marrjes së anëtarëve të organizatave."
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
      <h1 className="text-3xl font-semibold mb-6">Anëtarët e Organizatave</h1>
      <OrganizationMembersClientPage initialMembers={initialMembers} />
    </div>
  )
}
