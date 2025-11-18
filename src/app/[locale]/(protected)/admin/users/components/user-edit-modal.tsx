"use client"

import { useState } from "react"
import type { AdminUser } from "@/services/admin/users"
import type { AdminUserUpdateInput } from "@/validation/admin"
import { adminUserUpdateSchema } from "@/validation/admin"

interface UserEditModalProps {
  user: AdminUser
  onClose: () => void
  onSubmit: (data: AdminUserUpdateInput) => Promise<{ error?: string }>
}

export function UserEditModal({ user, onClose, onSubmit }: UserEditModalProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof AdminUserUpdateInput, string>>>({})

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const payload = {
      full_name: (formData.get("full_name") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      location: (formData.get("location") as string) ?? "",
      role: (formData.get("role") as string) ?? "",
      is_approved: formData.get("is_approved") === "on",
    }

    const parsed = adminUserUpdateSchema.safeParse(payload)
    if (!parsed.success) {
      const { fieldErrors: zodErrors } = parsed.error.flatten()
      setFieldErrors({
        full_name: zodErrors.full_name?.[0],
        email: zodErrors.email?.[0],
        location: zodErrors.location?.[0],
        role: zodErrors.role?.[0],
      })
      setServerError("Kontrolloni fushat e shënuara dhe provoni përsëri.")
      return
    }

    setFieldErrors({})
    setServerError(null)

    const result = await onSubmit(parsed.data)
    if (result.error) {
      setServerError(result.error)
      return
    }

    onClose()
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Edito Përdoruesin</h2>
        {serverError && <p className="text-sm text-red-600 mb-2">{serverError}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-gray-700 text-sm font-bold mb-2">
              Emri i Plotë
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              defaultValue={user.full_name}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {fieldErrors.full_name && <p className="text-xs text-red-600">{fieldErrors.full_name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={user.email}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
              Vendndodhja
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={user.location}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {fieldErrors.location && <p className="text-xs text-red-600">{fieldErrors.location}</p>}
          </div>
          <div>
            <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
              Roli
            </label>
            <select
              id="role"
              name="role"
              defaultValue={user.role}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="Individ">Individ</option>
              <option value="Admin">Admin</option>
            </select>
            {fieldErrors.role && <p className="text-xs text-red-600">{fieldErrors.role}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_approved"
              name="is_approved"
              defaultChecked={user.is_approved}
              className="h-4 w-4 border rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="eshte_aprovuar" className="text-sm text-gray-700">
              Aprovuar
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Anulo
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Ruaj Ndryshimet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
