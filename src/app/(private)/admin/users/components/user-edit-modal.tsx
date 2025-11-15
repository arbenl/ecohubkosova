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
      emri_i_plote: (formData.get("emri_i_plote") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      vendndodhja: (formData.get("vendndodhja") as string) ?? "",
      roli: (formData.get("roli") as string) ?? "",
      eshte_aprovuar: formData.get("eshte_aprovuar") === "on",
    }

    const parsed = adminUserUpdateSchema.safeParse(payload)
    if (!parsed.success) {
      const { fieldErrors: zodErrors } = parsed.error.flatten()
      setFieldErrors({
        emri_i_plote: zodErrors.emri_i_plote?.[0],
        email: zodErrors.email?.[0],
        vendndodhja: zodErrors.vendndodhja?.[0],
        roli: zodErrors.roli?.[0],
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
            <label htmlFor="emri_i_plote" className="block text-gray-700 text-sm font-bold mb-2">
              Emri i Plotë
            </label>
            <input
              type="text"
              id="emri_i_plote"
              name="emri_i_plote"
              defaultValue={user.emri_i_plote}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {fieldErrors.emri_i_plote && <p className="text-xs text-red-600">{fieldErrors.emri_i_plote}</p>}
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
            <label htmlFor="vendndodhja" className="block text-gray-700 text-sm font-bold mb-2">
              Vendndodhja
            </label>
            <input
              type="text"
              id="vendndodhja"
              name="vendndodhja"
              defaultValue={user.vendndodhja}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {fieldErrors.vendndodhja && <p className="text-xs text-red-600">{fieldErrors.vendndodhja}</p>}
          </div>
          <div>
            <label htmlFor="roli" className="block text-gray-700 text-sm font-bold mb-2">
              Roli
            </label>
            <select
              id="roli"
              name="roli"
              defaultValue={user.roli}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="Individ">Individ</option>
              <option value="Admin">Admin</option>
            </select>
            {fieldErrors.roli && <p className="text-xs text-red-600">{fieldErrors.roli}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="eshte_aprovuar"
              name="eshte_aprovuar"
              defaultChecked={user.eshte_aprovuar}
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
