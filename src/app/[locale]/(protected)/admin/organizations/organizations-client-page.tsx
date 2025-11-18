 "use client"

import { adminOrganizationUpdateSchema } from "@/validation/admin"
import { useAdminOrganizations } from "@/hooks/use-admin-organizations"

interface OrganizationsClientPageProps {
  initialOrganizations: Parameters<typeof useAdminOrganizations>[0]
}

export default function OrganizationsClientPage({ initialOrganizations }: OrganizationsClientPageProps) {
  const { organizations, editingOrganization, setEditingOrganization, handleDelete, handleUpdate } =
    useAdminOrganizations(initialOrganizations)

  return (
    <>
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
                <td className="py-2 px-4 border-b">{org.name}</td>
                <td className="py-2 px-4 border-b">{org.description}</td>
                <td className="py-2 px-4 border-b">{org.primary_interest}</td>
                <td className="py-2 px-4 border-b">{org.contact_person}</td>
                <td className="py-2 px-4 border-b">{org.contact_email}</td>
                <td className="py-2 px-4 border-b">{org.location}</td>
                <td className="py-2 px-4 border-b">{org.type}</td>
                <td className="py-2 px-4 border-b">{org.is_approved ? "Po" : "Jo"}</td>
                <td className="py-2 px-4 border-b">
        <button
          onClick={() => setEditingOrganization(org)}
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

      {editingOrganization && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-semibold mb-4">Edito Organizaten</h3>
            <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!editingOrganization) return

                    const formData = new FormData(e.currentTarget)
                    const updatedData = {
                      name: formData.get("name") as string,
                      description: formData.get("description") as string,
                      primary_interest: formData.get("primary_interest") as string,
                      contact_person: formData.get("contact_person") as string,
                      contact_email: formData.get("contact_email") as string,
                      location: formData.get("location") as string,
                      type: formData.get("type") as string,
                      is_approved: formData.get("is_approved") === "on",
                    }

                    const parsed = adminOrganizationUpdateSchema.safeParse(updatedData)
                    if (!parsed.success) {
                      alert(parsed.error.issues.map((issue) => issue.message).join("\n"))
                      return
                    }

                    const response = await handleUpdate(editingOrganization.id, parsed.data)
                    if (!response?.error) {
                      setEditingOrganization(null)
                    }
                  }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                  Emri:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={editingOrganization.name}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                  Pershkrimi:
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={editingOrganization.description}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="primary_interest" className="block text-gray-700 text-sm font-bold mb-2">
                  Interesi Primar:
                </label>
                <input
                  type="text"
                  id="primary_interest"
                  name="primary_interest"
                  defaultValue={editingOrganization.primary_interest}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="contact_person" className="block text-gray-700 text-sm font-bold mb-2">
                  Person Kontakti:
                </label>
                <input
                  type="text"
                  id="contact_person"
                  name="contact_person"
                  defaultValue={editingOrganization.contact_person}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="contact_email" className="block text-gray-700 text-sm font-bold mb-2">
                  Email Kontakti:
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  defaultValue={editingOrganization.contact_email}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
                  Vendndodhja:
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  defaultValue={editingOrganization.location}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">
                  Lloji:
                </label>
                <select
                  id="type"
                  name="type"
                  defaultValue={editingOrganization.type}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="OJQ">OJQ</option>
                  <option value="Ndërmarrje Sociale">Ndërmarrje Sociale</option>
                  <option value="Kompani">Kompani</option>
                </select>
              </div>
              <div>
                <label htmlFor="is_approved" className="block text-gray-700 text-sm font-bold mb-2">
                  Eshte Aprovuar:
                </label>
                <input
                  type="checkbox"
                  id="is_approved"
                  name="is_approved"
                  defaultChecked={editingOrganization?.is_approved}
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
                  onClick={() => setEditingOrganization(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Anulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
