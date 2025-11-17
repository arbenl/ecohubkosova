import HeaderClient from "@/components/layout/header/header-client"
import { fetchCurrentUserProfile } from "@/services/profile"
import { getServerUser } from "@/lib/supabase/server"

async function HeaderServer() {
  // First, check if there is an authenticated user
  const { user } = await getServerUser()

  // Only hit the database/profile service if a user session exists
  const { userProfile } = user
    ? await fetchCurrentUserProfile().catch((error) => {
        console.error("header profile fetch error:", error)
        return { userProfile: null }
      })
    : { userProfile: null }

  const fallbackName = userProfile?.emri_i_plote ?? user?.email?.split("@")[0] ?? null
  const fallbackEmail = userProfile?.email ?? user?.email ?? null

  return <HeaderClient fallbackUserName={fallbackName} fallbackUserEmail={fallbackEmail} />
}

export function Header() {
  return <HeaderServer />
}

export default Header
