"use client"

import { useState } from "react"
import { deleteListing, updateListing } from "./actions" // Import Server Actions

interface Listing {
  id: string
  created_by_user_id: string
  organization_id: string | null
  titulli: string
  pershkrimi: string
  kategori: string
  cmimi: number
  njesia: string
  vendndodhja: string
  sasia: string
  lloji_listimit: string
  eshte_aprovuar: boolean
  created_at: string
  updated_at: string | null
}

interface ListingsClientPageProps {
  initialListings: Listing[]
}

export default function ListingsClientPage({ initialListings }: ListingsClientPageProps) {
  const [listings, setListings] = useState<Listing[]>(initialListings)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)

  const handleDelete = async (id: string) => {
    if (window.confirm("A jeni i sigurt që doni ta fshini këtë listim?")) {
      const result = await deleteListing(id)
      if (result.error) {
        alert(result.error)
      } else {
        setListings(listings.filter((listing) => listing.id !== id))
        alert("Listimi u fshi me sukses!")
      }
    }
  }

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
                const updatedData = {
                  titulli: formData.get("titulli") as string,
                  pershkrimi: formData.get("pershkrimi") as string,
                  kategori: formData.get("kategori") as string,
                  cmimi: Number.parseFloat(formData.get("cmimi") as string),
                  njesia: formData.get("njesia") as string,
                  vendndodhja: formData.get("vendndodhja") as string,
                  sasia: formData.get("sasia") as string,
                  lloji_listimit: formData.get("lloji_listimit") as string,
                  eshte_aprovuar: formData.get("eshte_aprovuar") === "on",
                  updated_at: new Date().toISOString(),
                }

                const result = await updateListing(editingListing.id, updatedData)

                if (result.error) {
                  alert(result.error)
                } else {
                  setListings(listings.map(l => l.id === editingListing.id ? { ...l, ...updatedData } : l));
                  setEditingListing(null)
                  alert("Listimi u përditësua me sukses!")
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