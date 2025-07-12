"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  emri_i_plotë: string
  email: string
  vendndodhja: string
  roli: string
  eshte_aprovuar: boolean
  created_at: string
  updated_at: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("users").select("*")
      if (error) {
        console.error("Gabim gjatë marrjes së përdoruesve:", error)
        alert("Gabim gjatë marrjes së përdoruesve")
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error("Gabim gjatë marrjes së përdoruesve:", error)
      alert("Gabim gjatë marrjes së përdoruesve")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("A jeni i sigurt që doni ta fshini këtë përdorues?")
    if (!confirmDelete) return

    try {
      const { error } = await supabase.from("users").delete().eq("id", id)

      if (error) {
        console.error("Gabim gjatë fshirjes së përdoruesit:", error)
        alert("Gabim gjatë fshirjes së përdoruesit")
      } else {
        fetchUsers()
        alert("Përdoruesi u fshi me sukses!")
      }
    } catch (error) {
      console.error("Gabim gjatë fshirjes së përdoruesit:", error)
      alert("Gabim gjatë fshirjes së përdoruesit")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Duke u ngarkuar përdoruesit...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Përdoruesit</h1>
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
                <td className="py-2 px-4 border-b">{user.emri_i_plotë}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.vendndodhja}</td>
                <td className="py-2 px-4 border-b">{user.roli}</td>
                <td className="py-2 px-4 border-b">{user.eshte_aprovuar ? "Po" : "Jo"}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Edito
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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

      {editingUser && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edito Përdoruesin</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!editingUser) return

                try {
                  const formData = new FormData(e.currentTarget)
                  const updatedData = {
                    emri_i_plotë: formData.get("emri_i_plotë") as string,
                    email: formData.get("email") as string,
                    vendndodhja: formData.get("vendndodhja") as string,
                    roli: formData.get("roli") as string,
                    eshte_aprovuar: formData.get("eshte_aprovuar") === "on",
                    updated_at: new Date().toISOString(),
                  }

                  const { error } = await supabase.from("users").update(updatedData).eq("id", editingUser.id)

                  if (error) throw error

                  fetchUsers()
                  setEditingUser(null)
                  alert("Përdoruesi u përditësua me sukses!")
                } catch (error) {
                  console.error("Gabim gjatë përditësimit të përdoruesit:", error)
                  alert("Gabim gjatë përditësimit të përdoruesit")
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="emri_i_plotë" className="block text-gray-700 text-sm font-bold mb-2">
                  Emri i Plotë:
                </label>
                <input
                  type="text"
                  id="emri_i_plotë"
                  name="emri_i_plotë"
                  defaultValue={editingUser.emri_i_plotë}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={editingUser.email}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="vendndodhja" className="block text-gray-700 text-sm font-bold mb-2">
                  Vendndodhja:
                </label>
                <input
                  type="text"
                  id="vendndodhja"
                  name="vendndodhja"
                  defaultValue={editingUser.vendndodhja}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
          <div>
  <label htmlFor="roli" className="block text-gray-700 text-sm font-bold mb-2">
    Roli:
  </label>
  <select
    id="roli"
    name="roli"
    defaultValue={editingUser.roli}
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    required
  >
    <option value="Individ">Individ</option>
    <option value="Admin">Admin</option>
  </select>
</div>
              <div>
                <label htmlFor="eshte_aprovuar" className="block text-gray-700 text-sm font-bold mb-2">
                  Aprovuar:
                </label>
                <input
                  type="checkbox"
                  id="eshte_aprovuar"
                  name="eshte_aprovuar"
                  defaultChecked={editingUser.eshte_aprovuar}
                  className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
      )}
    </div>
  )
}
