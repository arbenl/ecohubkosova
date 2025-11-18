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
                <td className="py-2 px-4 border-b">{listing.title}</td>
                <td className="py-2 px-4 border-b">{listing.category}</td>
                <td className="py-2 px-4 border-b">
                  {listing.price} {listing.unit}
                </td>
                <td className="py-2 px-4 border-b">{listing.unit}</td>
                <td className="py-2 px-4 border-b">{listing.location}</td>
                <td className="py-2 px-4 border-b">{listing.is_approved ? "Po" : "Jo"}</td>
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
                const priceField = formData.get("price")
                const priceValue =
                  typeof priceField === "string" && priceField.trim().length
                    ? Number.parseFloat(priceField)
                    : Number.NaN
                const updatedData = {
                  title: formData.get("title") as string,
                  description: formData.get("description") as string,
                  category: formData.get("category") as string,
                  price: priceValue,
                  unit: formData.get("unit") as string,
                  location: formData.get("location") as string,
                  quantity: formData.get("quantity") as string,
                  listing_type: formData.get("listing_type") as string,
                  is_approved: formData.get("is_approved") === "on",
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
                <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                  Titulli:
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  defaultValue={editingListing.title}
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
                  defaultValue={editingListing.description}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
                  Kategoria:
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  defaultValue={editingListing.category}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">
                  Cmimi:
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="price"
                  name="price"
                  defaultValue={editingListing.price}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="unit" className="block text-gray-700 text-sm font-bold mb-2">
                  Njesia:
                </label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  defaultValue={editingListing.unit}
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
                  defaultValue={editingListing.location}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">
                  Sasia:
                </label>
                <input
                  type="text"
                  id="quantity"
                  name="quantity"
                  defaultValue={editingListing.quantity}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label htmlFor="listing_type" className="block text-gray-700 text-sm font-bold mb-2">
                  Lloji i Listimit:
                </label>
                <select
                  id="listing_type"
                  name="listing_type"
                  defaultValue={editingListing.listing_type}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="shes">Shes</option>
                  <option value="blej">Blej</option>
                </select>
              </div>
              <div>
                <label htmlFor="is_approved" className="block text-gray-700 text-sm font-bold mb-2">
                  Aprovuar:
                </label>
                <input
                  type="checkbox"
                  id="is_approved"
                  name="is_approved"
                  defaultChecked={editingListing.is_approved}
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
