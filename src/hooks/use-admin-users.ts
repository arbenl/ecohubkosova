"use client"

import { useCallback, useState } from "react"
import type { AdminUser } from "@/services/admin/users"
import type { AdminUserUpdateInput } from "@/validation/admin"
import { deleteUser, updateUser } from "@/app/[locale]/(protected)/admin/users/actions"

type UpdateResponse = { error?: string }

export function useAdminUsers(initialUsers: AdminUser[]) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("A jeni i sigurt që doni ta fshini këtë përdorues?")) {
      return
    }

    const result = await deleteUser(id)
    if (result.error) {
      alert(result.error)
      return
    }

    setUsers((prev) => prev.filter((user) => user.id !== id))
    alert("Përdoruesi u fshi me sukses!")
  }, [])

  const handleUpdate = useCallback(
    async (data: AdminUserUpdateInput): Promise<UpdateResponse> => {
      if (!editingUser) {
        return { error: "Përdoruesi nuk u gjet." }
      }

      const result = await updateUser(editingUser.id, data)
      if (result.error) {
        return { error: result.error }
      }

      setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? { ...user, ...data } : user)))
      alert("Përdoruesi u përditësua me sukses!")
      return {}
    },
    [editingUser]
  )

  return {
    users,
    editingUser,
    setEditingUser,
    handleDelete,
    handleUpdate,
  }
}
