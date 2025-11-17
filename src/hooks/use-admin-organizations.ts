"use client"

import { useCallback, useState } from "react"
import { deleteOrganization, updateOrganization } from "@/app/[locale]/(protected)/admin/organizations/actions"
import type { AdminOrganizationUpdateInput } from "@/validation/admin"

export interface AdminOrganization {
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

type AdminCrudResponse = { error?: string } | void

export function useAdminOrganizations(initialOrganizations: AdminOrganization[]) {
  const [organizations, setOrganizations] = useState<AdminOrganization[]>(initialOrganizations)
  const [editingOrganization, setEditingOrganization] = useState<AdminOrganization | null>(null)

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("A jeni i sigurt që doni ta fshini këtë organizatë?")) {
      return
    }

    const result = await deleteOrganization(id)
    if (result.error) {
      alert(result.error)
      return
    }

    setOrganizations((prev) => prev.filter((org) => org.id !== id))
    alert("Organizata u fshi me sukses!")
  }, [])

  const handleUpdate = useCallback(
    async (id: string, parsedData: AdminOrganizationUpdateInput): Promise<AdminCrudResponse> => {
      const result = await updateOrganization(id, parsedData)

      if (result.error) {
        return { error: result.error }
      }

      setOrganizations((prev) =>
        prev.map((org) => (org.id === id ? { ...org, ...parsedData } : org))
      )
      alert("Organizata u përditësua me sukses!")
      return {}
    },
    []
  )

  return {
    organizations,
    editingOrganization,
    setEditingOrganization,
    handleDelete,
    handleUpdate,
  }
}
