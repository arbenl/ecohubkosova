"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  roli_ne_organizate: string
  eshte_aprovuar: boolean
  created_at: string
}

interface OrganizationMemberWithDetails extends OrganizationMember {
  organization_name?: string
  user_name?: string
  user_email?: string
}

export default function OrganizationMembersPage() {
  const [members, setMembers] = useState<OrganizationMemberWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMember, setEditingMember] = useState<OrganizationMemberWithDetails | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("organization_members").select(`
          *,
          organizations!inner(emri),
          users!inner(emri_i_plotë, email)
        `)

      if (error) {
        console.error("Gabim gjatë marrjes së anëtarëve:", error)
        alert("Gabim gjatë marrjes së anëtarëve")
      } else {
        const membersWithDetails =
          data?.map((member: any) => ({
            ...member,
            organization_name: member.organizations?.emri,
            user_name: member.users?.emri_i_plotë,
            user_email: member.users?.email,
          })) || []
        setMembers(membersWithDetails)
      }
    } catch (error) {
      console.error("Gabim gjatë marrjes së anëtarëve:", error)
      alert("Gabim gjatë marrjes së anëtarëve")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("A jeni i sigurt që doni ta fshini këtë anëtar?")
    if (!confirmDelete) return

    try {
      const { error } = await supabase.from("organization_members").delete().eq("id", id)

      if (error) {
        console.error("Gabim gjatë fshirjes së anëtarit:", error)
        alert("Gabim gjatë fshirjes së anëtarit")
      } else {
        fetchMembers()
        alert("Anëtari u fshi me sukses!")
      }
    } catch (error) {
      console.error("Gabim gjatë fshirjes së anëtarit:", error)
      alert("Gabim gjatë fshirjes së anëtarit")
    }
  }

  const handleApprovalToggle = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("organization_members")
        .update({ eshte_aprovuar: !currentStatus })
        .eq("id", id)

      if (error) {
        console.error("Gabim gjatë ndryshimit të statusit:", error)
        alert("Gabim gjatë ndryshimit të statusit")
      } else {
        fetchMembers()
        alert(`Anëtari u ${!currentStatus ? "aprovua" : "çaprovua"} me sukses!`)
      }
    } catch (error) {
      console.error("Gabim gjatë ndryshimit të statusit:", error)
      alert("Gabim gjatë ndryshimit të statusit")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Duke u ngarkuar anëtarët e organizatave...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Anëtarët e Organizatave</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Organizata</th>
              <th className="py-2 px-4 border-b">Përdoruesi</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Roli në Organizatë</th>
              <th className="py-2 px-4 border-b">Aprovuar</th>
              <th className="py-2 px-4 border-b">Veprime</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{member.organization_name}</td>
                <td className="py-2 px-4 border-b">{member.user_name}</td>
                <td className="py-2 px-4 border-b">{member.user_email}</td>
                <td className="py-2 px-4 border-b">{member.roli_ne_organizate}</td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`px-2 py-1 rounded text-sm ${member.eshte_aprovuar ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {member.eshte_aprovuar ? "Po" : "Jo"}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleApprovalToggle(member.id, member.eshte_aprovuar)}
                    className={`${
                      member.eshte_aprovuar ? "bg-orange-500 hover:bg-orange-700" : "bg-green-500 hover:bg-green-700"
                    } text-white font-bold py-2 px-4 rounded mr-2`}
                  >
                    {member.eshte_aprovuar ? "Çaprovo" : "Aprovo"}
                  </button>
                  <button
                    onClick={() => setEditingMember(member)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Edito
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
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

      {editingMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">Edito Anëtarin e Organizatës</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!editingMember) return

                try {
                  const formData = new FormData(e.currentTarget)
                  const updatedData = {
                    roli_ne_organizate: formData.get("roli_ne_organizate") as string,
                    eshte_aprovuar: formData.get("eshte_aprovuar") === "on",
                  }

                  const { error } = await supabase
                    .from("organization_members")
                    .update(updatedData)
                    .eq("id", editingMember.id)

                  if (error) throw error

                  fetchMembers()
                  setEditingMember(null)
                  alert("Anëtari u përditësua me sukses!")
                } catch (error) {
                  console.error("Gabim gjatë përditësimit të anëtarit:", error)
                  alert("Gabim gjatë përditësimit të anëtarit")
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="roli_ne_organizate" className="block text-gray-700 text-sm font-bold mb-2">
                  Roli në Organizatë:
                </label>
                <input
                  type="text"
                  id="roli_ne_organizate"
                  name="roli_ne_organizate"
                  defaultValue={editingMember.roli_ne_organizate}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="eshte_aprovuar" className="block text-gray-700 text-sm font-bold mb-2">
                  Eshte Aprovuar:
                </label>
                <input
                  type="checkbox"
                  id="eshte_aprovuar"
                  name="eshte_aprovuar"
                  defaultChecked={editingMember.eshte_aprovuar}
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
                  onClick={() => setEditingMember(null)}
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
