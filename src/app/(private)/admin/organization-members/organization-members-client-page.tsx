"use client"

import { adminOrganizationMemberUpdateSchema } from "@/validation/admin"
import { useAdminOrganizationMembers } from "@/hooks/use-admin-organization-members"

interface OrganizationMembersClientPageProps {
  initialMembers: Parameters<typeof useAdminOrganizationMembers>[0]
}

export default function OrganizationMembersClientPage({ initialMembers }: OrganizationMembersClientPageProps) {
  const {
    members,
    editingMember,
    setEditingMember,
    handleDelete,
    handleToggleApproval,
    handleUpdate,
  } = useAdminOrganizationMembers(initialMembers)

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Organizata</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Përdoruesi</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Roli</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Aprovuar</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{member.organization_name}</td>
                <td className="px-4 py-3">{member.user_name}</td>
                <td className="px-4 py-3">{member.user_email}</td>
                <td className="px-4 py-3">{member.roli_ne_organizate}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      member.eshte_aprovuar ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {member.eshte_aprovuar ? "Po" : "Jo"}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                    onClick={() => setEditingMember(member)}
                  >
                    Edito
                  </button>
                  <button
                    className={`rounded-md px-3 py-1 text-xs text-white ${
                      member.eshte_aprovuar ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"
                    }`}
                    onClick={() => handleToggleApproval(member.id, member.eshte_aprovuar)}
                  >
                    {member.eshte_aprovuar ? "Çaprovo" : "Aprovo"}
                  </button>
                  <button
                    className="rounded-md bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                    onClick={() => handleDelete(member.id)}
                  >
                    Fshi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Edito anëtarin</h3>
            <form
              className="space-y-3"
              onSubmit={async (event) => {
                event.preventDefault()

                const formData = new FormData(event.currentTarget)
                const payload = {
                  roli_ne_organizate: formData.get("roli_ne_organizate") as string,
                  eshte_aprovuar: formData.get("eshte_aprovuar") === "on",
                }

                const parsed = adminOrganizationMemberUpdateSchema.safeParse(payload)
                if (!parsed.success) {
                  alert(parsed.error.issues.map((issue) => issue.message).join("\n"))
                  return
                }

                const response = await handleUpdate(editingMember.id, parsed.data)
                if (!response?.error) {
                  setEditingMember(null)
                }
              }}
            >
              <input
                name="roli_ne_organizate"
                defaultValue={editingMember.roli_ne_organizate}
                className="w-full rounded-md border px-3 py-2"
              />
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name="eshte_aprovuar" defaultChecked={editingMember.eshte_aprovuar} />
                Aprobimi
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md bg-gray-200 px-3 py-1 text-sm"
                  onClick={() => setEditingMember(null)}
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                >
                  Ruaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
