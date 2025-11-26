import { getUsers } from "./actions"
import UsersClientPage from "./users-client-page"

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: string
  location: string
  is_approved: boolean
  created_at: string
  updated_at: string | null
}

export default async function UsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { data, error } = await getUsers()
  const initialUsers: AdminUser[] = data ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <UsersClientPage initialUsers={initialUsers} initialError={error} locale={locale} />
    </div>
  )
}
