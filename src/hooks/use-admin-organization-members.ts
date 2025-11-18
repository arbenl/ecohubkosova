"use client"

import { useCallback, useState } from "react"
import {
  adminOrganizationMemberUpdateSchema,
} from "@/validation/admin"
import {
  deleteOrganizationMember,
  updateOrganizationMember,
  toggleOrganizationMemberApproval,
} from "@/app/[locale]/(protected)/admin/organization-members/actions"

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role_in_organization: string
  is_approved: boolean
  created_at: string
}

export interface OrganizationMemberWithDetails extends OrganizationMember {
  organization_name?: string
  user_name?: string
  user_email?: string
}

type UpdateResponse = { error?: string } | void

export function useAdminOrganizationMembers(initialMembers: OrganizationMemberWithDetails[]) {
  const [members, setMembers] = useState(initialMembers)
  const [editingMember, setEditingMember] = useState<OrganizationMemberWithDetails | null>(null)

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("A jeni i sigurt që doni ta fshini këtë anëtar?")) {
      return
    }

    const result = await deleteOrganizationMember(id)
    if (result.error) {
      alert(result.error)
      return
    }

    setMembers((prev) => prev.filter((member) => member.id !== id))
    alert("Anëtari u fshi me sukses!")
  }, [])

  const handleToggleApproval = useCallback(async (id: string, currentStatus: boolean) => {
    const result = await toggleOrganizationMemberApproval(id, currentStatus)
    if (result.error) {
      alert(result.error)
      return
    }

    setMembers((prev) =>
      prev.map((member) => (member.id === id ? { ...member, is_approved: !currentStatus } : member))
    )
    alert(`Anëtari u ${currentStatus ? "çaprovua" : "aprovua"} me sukses!`)
  }, [])

  const handleUpdate = useCallback(
    async (id: string, payload: Parameters<typeof updateOrganizationMember>[1]): Promise<UpdateResponse> => {
      const result = await updateOrganizationMember(id, payload)

      if (result.error) {
        return { error: result.error }
      }

      setMembers((prev) => prev.map((member) => (member.id === id ? { ...member, ...payload } : member)))
      alert("Anëtari u përditësua me sukses!")
      return {}
    },
    []
  )

  return {
    members,
    editingMember,
    setEditingMember,
    handleDelete,
    handleToggleApproval,
    handleUpdate,
  }
}
