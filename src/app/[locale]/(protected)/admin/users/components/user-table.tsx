"use client"

import type { AdminUser } from "@/services/admin/users"

interface UserTableProps {
  users: AdminUser[]
  onEdit: (user: AdminUser) => void
  onDelete: (userId: string) => void
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Emri i Plotë</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Vendndodhja</th>
            <th className="py-2 px-4 border-b">Roli</th>
            <th className="py-2 px-4 border-b">Aprovuar</th>
            <th className="py-2 px-4 border-b">Aksione</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-2 px-4 border-b">{user.full_name}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.location}</td>
              <td className="py-2 px-4 border-b">{user.role}</td>
              <td className="py-2 px-4 border-b">{user.is_approved ? "Po" : "Jo"}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onEdit(user)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Edito
                </button>
                <button
                  onClick={() => onDelete(user.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Fshij
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
