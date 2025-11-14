"use client"

import { useState } from "react"
import type { AdminUser } from "@/services/admin/users"
import type { AdminUserUpdateInput } from "@/validation/admin"
import { deleteUser, updateUser } from "./actions"
import { UserTable } from "./components/user-table"
import { UserEditModal } from "./components/user-edit-modal"

interface UsersClientPageProps {
  initialUsers: AdminUser[]
}

export default function UsersClientPage({ initialUsers }: UsersClientPageProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("A jeni i sigurt që doni ta fshini këtë përdorues?")
    if (!confirmDelete) return

    const result = await deleteUser(id)
    if (result.error) {
      alert(result.error)
    } else {
      setUsers((prev) => prev.filter((user) => user.id !== id))
      alert("Përdoruesi u fshi me sukses!")
    }
  }

  const handleUpdate = async (data: AdminUserUpdateInput) => {
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
  }

  return (
    <>
      <UserTable users={users} onEdit={setEditingUser} onDelete={handleDelete} />
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={async (data) => {
            const response = await handleUpdate(data)
            if (!response.error) {
              setEditingUser(null)
            }
            return response
          }}
        />
      )}
    </>
  )
}
