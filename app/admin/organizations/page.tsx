"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Organization {
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

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("organizations").select("*")
      if (error) {
        console.error("Gabim gjatë marrjes së organizatave:", error)
        alert("Gabim gjatë marrjes së organizatave")
      } else {
        setOrganizations(data || [])
      }
    } catch (error) {
      console.error("Gabim gjatë marrjes së organizatave:", error)
      alert("Gabim gjatë marrjes së organizatave")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("A jeni i sigurt që doni ta fshini këtë organizatë?")
    if (!confirmDelete) return

    try {
      const { error } = await supabase.from("organizations").delete().eq("id", id)

      if (error) {
        console.error("Gabim gjatë fshirjes së organizatës:", error)
        alert("Gabim gjatë fshirjes së organizatës")
      } else {
        fetchOrganizations()
        alert("Organizata u fshi me sukses!")
      }
    } catch (error) {
      console.error("Gabim gjatë fshirjes së organizatës:", error)
      alert("Gabim gjatë fshirjes së organizatës")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Duke u ngarkuar organizatat...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Organizatat</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Emri</th>
              <th className="py-2 px-4 border-b">Pershkrimi</th>
              <th className="py-2 px-4 border-b">Interesi Primar</th>
              <th className="py-2 px-4 border-b">Person Kontakti</th>
              <th className="py-2 px-4 border-b">Email Kontakti</th>
              <th className="py-2 px-4 border-b">Vendndodhja</th>
              <th className="py-2 px-4 border-b">Lloji</th>
              <th className="py-2 px-4 border-b">Eshte Aprovuar</th>
              <th className="py-2 px-4 border-b">Veprime</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{org.emri}</td>
                <td className="py-2 px-4 border-b">{org.pershkrimi}</td>
                <td className="py-2 px-4 border-b">{org.interesi_primar}</td>
                <td className="py-2 px-4 border-b">{org.person_kontakti}</td>
                <td className="py-2 px-4 border-b">{org.email_kontakti}</td>
                <td className="py-2 px-4 border-b">{org.vendndodhja}</td>
                <td className="py-2 px-4 border-b">{org.lloji}</td>
                <td className="py-2 px-4 border-b">{org.eshte_aprovuar ? "Po" : "Jo"}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => setEditingOrg(org)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Edito
                  </button>
                  <button
                    onClick={() => handleDelete(org.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Fshije
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingOrg && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">Edito Organizaten</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!editingOrg) return

                try {
                  const formData = new FormData(e.currentTarget)
                  const updatedData = {
                    emri: formData.get("emri") as string,
                    pershkrimi: formData.get("pershkrimi") as string,
                    interesi_primar: formData.get("interesi_primar") as string,
                    person_kontakti: formData.get("person_kontakti") as string,
                    email_kontakti: formData.get("email_kontakti") as string,
                    vendndodhja: formData.get("vendndodhja") as string,
                    lloji: formData.get("lloji") as string,
                    eshte_aprovuar: formData.get("eshte_aprovuar") === "on",
                    updated_at: new Date().toISOString(),
                  }

                  const { error } = await supabase.from("organizations").update(updatedData).eq("id", editingOrg.id)

                  if (error) throw error

                  fetchOrganizations()
                  setEditingOrg(null)
                  alert("Organizata u përditësua me sukses!")
                } catch (error) {
                  console.error("Gabim gjatë përditësimit të organizatës:", error)
                  alert("Gabim gjatë përditësimit të organizatës")
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="emri" className="block text-gray-700 text-sm font-bold mb-2">
                  Emri:
                </label>
                <input
                  type="text"
                  id="emri"
                  name="emri"
                  defaultValue={editingOrg.emri}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="pershkrimi" className="block text-gray-700 text-sm font-bold mb-2">
                  Pershkrimi:
                </label>
                <textarea
                  id="pershkrimi"
                  name="pershkrimi"
                  defaultValue={editingOrg.pershkrimi}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="interesi_primar" className="block text-gray-700 text-sm font-bold mb-2">
                  Interesi Primar:
                </label>
                <input
                  type="text"
                  id="interesi_primar"
                  name="interesi_primar"
                  defaultValue={editingOrg.interesi_primar}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="person_kontakti" className="block text-gray-700 text-sm font-bold mb-2">
                  Person Kontakti:
                </label>
                <input
                  type="text"
                  id="person_kontakti"
                  name="person_kontakti"
                  defaultValue={editingOrg.person_kontakti}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="email_kontakti" className="block text-gray-700 text-sm font-bold mb-2">
                  Email Kontakti:
                </label>
                <input
                  type="email"
                  id="email_kontakti"
                  name="email_kontakti"
                  defaultValue={editingOrg.email_kontakti}
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
                  defaultValue={editingOrg.vendndodhja}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
             <div>
          <label htmlFor="lloji" className="block text-gray-700 text-sm font-bold mb-2">
    Lloji:
  </label>
  <select
    id="lloji"
    name="lloji"
    defaultValue={editingOrg.lloji}
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    required
  >
    <option value="OJQ">OJQ</option>
    <option value="Ndërmarrje Sociale">Ndërmarrje Sociale</option>
    <option value="Kompani">Kompani</option>
  </select>
</div>
              <div>
                <label htmlFor="eshte_aprovuar" className="block text-gray-700 text-sm font-bold mb-2">
                  Eshte Aprovuar:
                </label>
                <input
                  type="checkbox"
                  id="eshte_aprovuar"
                  name="eshte_aprovuar"
                  defaultChecked={editingOrg.eshte_aprovuar}
                  className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Ruaj Ndryshimet
                </button>
                <button
                  type="button"
                  onClick={() => setEditingOrg(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Anulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
