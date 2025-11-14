import HeaderClient from "@/components/header-client"
import { fetchCurrentUserProfile } from "@/services/profile"
import { getServerUser } from "@/lib/supabase/server"

async function HeaderServer() {
  const [{ userProfile }, { user }] = await Promise.all([
    fetchCurrentUserProfile().catch((error) => {
      console.error("header profile fetch error:", error)
      return { userProfile: null }
    }),
    getServerUser(),
  ])

  const fallbackName = userProfile?.emri_i_plote ?? user?.email?.split("@")[0] ?? null
  const fallbackEmail = userProfile?.email ?? user?.email ?? null

  return <HeaderClient fallbackUserName={fallbackName} fallbackUserEmail={fallbackEmail} />
}

export function Header() {
  // @ts-expect-error Async Server Component
  return <HeaderServer />
}

export default Header
