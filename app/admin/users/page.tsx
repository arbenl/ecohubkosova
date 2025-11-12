import { createServerSupabaseClient } from "@/lib/supabase/server"
import UsersClientPage from "./users-client-page" // Will create this client component later

interface User {
  id: string
  emri_i_plotë: string
  email: string
  vendndodhja: string
  roli: string
  eshte_aprovuar: boolean
  created_at: string
  updated_at: string | null
}

export default async function UsersPage() {
  const supabase = createServerSupabaseClient()

  let initialUsers: User[] = []
  let error: string | null = null

  try {
    const { data, error: fetchError } = await supabase.from("users").select("*")
    if (fetchError) {
      throw fetchError
    }
    initialUsers = data || []
  } catch (err: any) {
    console.error("Error fetching users:", err)
    error = "Gabim gjatë marrjes së përdoruesve."
  }

  if (error) {
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
