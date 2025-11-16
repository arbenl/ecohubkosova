import { getUsers } from "./actions"
import UsersClientPage from "./users-client-page" // Will create this client component later

interface User {
  id: string
  emri_i_plote: string
  email: string
  vendndodhja: string
  roli: string
  eshte_aprovuar: boolean
  created_at: string
  updated_at: string | null
}

export default async function UsersPage() {
  const { data, error } = await getUsers()
  const initialUsers: User[] = data ?? []

  if (error) {
    console.error("Error fetching users:", error)
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Përdoruesit</h1>
      <UsersClientPage initialUsers={initialUsers} />
    </div>
  )
}
