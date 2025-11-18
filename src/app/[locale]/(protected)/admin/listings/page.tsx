import { getListings } from "./actions"
import ListingsClientPage from "./listings-client-page" // Will create this client component later
import type { AdminListing } from "@/hooks/use-admin-listings"

export default async function ListingsPage() {
  const { data, error } = await getListings()
  const initialListings: AdminListing[] = data ?? []

  if (error) {
    console.error("Error fetching listings:", error)
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-5">Listimet e Tregut</h1>
      <ListingsClientPage initialListings={initialListings} />
    </div>
  )
}
