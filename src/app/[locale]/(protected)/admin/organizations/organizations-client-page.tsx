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
                      emri: formData.get("emri") as string,
                      pershkrimi: formData.get("pershkrimi") as string,
                      interesi_primar: formData.get("interesi_primar") as string,
                      person_kontakti: formData.get("person_kontakti") as string,
                      email_kontakti: formData.get("email_kontakti") as string,
                      vendndodhja: formData.get("vendndodhja") as string,
                      lloji: formData.get("lloji") as string,
                      eshte_aprovuar: formData.get("eshte_aprovuar") === "on",
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
                <label htmlFor="emri" className="block text-gray-700 text-sm font-bold mb-2">
                  Emri:
                </label>
                <input
                  type="text"
                  id="emri"
                  name="emri"
                  defaultValue={editingOrganization.emri}
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
                  defaultValue={editingOrganization.pershkrimi}
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
                  defaultValue={editingOrganization.interesi_primar}
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
                  defaultValue={editingOrganization.person_kontakti}
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
                  defaultValue={editingOrganization.email_kontakti}
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
                  defaultValue={editingOrganization.vendndodhja}
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
                  defaultValue={editingOrganization.lloji}
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
                  defaultChecked={editingOrganization?.eshte_aprovuar}
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
