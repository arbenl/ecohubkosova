"use client"

import { useAdminUsers } from "@/hooks/use-admin-users"
import { UserTable } from "./components/user-table"
import { UserEditModal } from "./components/user-edit-modal"
import type { AdminUser } from "@/services/admin/users"

interface UsersClientPageProps {
  initialUsers: AdminUser[]
}

export default function UsersClientPage({ initialUsers }: UsersClientPageProps) {
  const { users, editingUser, setEditingUser, handleDelete, handleUpdate } = useAdminUsers(initialUsers)

  return (
    <>
      <UserTable users={users} onEdit={setEditingUser} onDelete={handleDelete} />
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={async (data) => {
            const response = await handleUpdate(data)
            if (!response?.error) {
              setEditingUser(null)
            }
            return response
          }}
        />
      )}
    </>
  )
}
