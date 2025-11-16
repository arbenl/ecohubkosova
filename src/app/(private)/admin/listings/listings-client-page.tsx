"use client"

import { adminListingUpdateSchema } from "@/validation/admin"
import { useAdminListings } from "@/hooks/use-admin-listings"

interface ListingsClientPageProps {
  initialListings: Parameters<typeof useAdminListings>[0]
}

export default function ListingsClientPage({ initialListings }: ListingsClientPageProps) {
  const { listings, editingListing, setEditingListing, handleDelete, handleUpdate } =
    useAdminListings(initialListings)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Titulli</th>
              <th className="py-2 px-4 border-b">Kategoria</th>
              <th className="py-2 px-4 border-b">Cmimi</th>
              <th className="py-2 px-4 border-b">Njesia</th>
              <th className="py-2 px-4 border-b">Vendndodhja</th>
              <th className="py-2 px-4 border-b">Aprovuar</th>
              <th className="py-2 px-4 border-b">Veprime</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{listing.titulli}</td>
                <td className="py-2 px-4 border-b">{listing.kategori}</td>
                <td className="py-2 px-4 border-b">
                  {listing.cmimi} {listing.njesia}
                </td>
                <td className="py-2 px-4 border-b">{listing.njesia}</td>
                <td className="py-2 px-4 border-b">{listing.vendndodhja}</td>
                <td className="py-2 px-4 border-b">{listing.eshte_aprovuar ? "Po" : "Jo"}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => setEditingListing(listing)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Edito
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id)}
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

      {editingListing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edito Listimin</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!editingListing) return

                const formData = new FormData(e.currentTarget)
                const cmimiField = formData.get("cmimi")
                const cmimiValue =
                  typeof cmimiField === "string" && cmimiField.trim().length
                    ? Number.parseFloat(cmimiField)
                    : Number.NaN
                const updatedData = {
                  titulli: formData.get("titulli") as string,
                  pershkrimi: formData.get("pershkrimi") as string,
                  kategori: formData.get("kategori") as string,
                  cmimi: cmimiValue,
                  njesia: formData.get("njesia") as string,
                  vendndodhja: formData.get("vendndodhja") as string,
                  sasia: formData.get("sasia") as string,
                  lloji_listimit: formData.get("lloji_listimit") as string,
                  eshte_aprovuar: formData.get("eshte_aprovuar") === "on",
                }

                const parsed = adminListingUpdateSchema.safeParse(updatedData)
                if (!parsed.success) {
                  alert(parsed.error.issues.map((issue) => issue.message).join("\n"))
                  return
                }

                const response = await handleUpdate(editingListing.id, parsed.data)

                if (!response?.error) {
                  setEditingListing(null)
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="titulli" className="block text-gray-700 text-sm font-bold mb-2">
                  Titulli:
                </label>
                <input
                  type="text"
                  id="titulli"
                  name="titulli"
                  defaultValue={editingListing.titulli}
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
                  defaultValue={editingListing.pershkrimi}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="kategori" className="block text-gray-700 text-sm font-bold mb-2">
                  Kategoria:
                </label>
                <input
                  type="text"
                  id="kategori"
                  name="kategori"
                  defaultValue={editingListing.kategori}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="cmimi" className="block text-gray-700 text-sm font-bold mb-2">
                  Cmimi:
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="cmimi"
                  name="cmimi"
                  defaultValue={editingListing.cmimi}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="njesia" className="block text-gray-700 text-sm font-bold mb-2">
                  Njesia:
                </label>
                <input
                  type="text"
                  id="njesia"
                  name="njesia"
                  defaultValue={editingListing.njesia}
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
                  defaultValue={editingListing.vendndodhja}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="sasia" className="block text-gray-700 text-sm font-bold mb-2">
                  Sasia:
                </label>
                <input
                  type="text"
                  id="sasia"
                  name="sasia"
                  defaultValue={editingListing.sasia}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="lloji_listimit" className="block text-gray-700 text-sm font-bold mb-2">
                  Lloji i Listimit:
                </label>
                <select
                  id="lloji_listimit"
                  name="lloji_listimit"
                  defaultValue={editingListing.lloji_listimit}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="shes">Shes</option>
                  <option value="blej">Blej</option>
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
                  defaultChecked={editingListing.eshte_aprovuar}
                  className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
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
    </>
  )
}
