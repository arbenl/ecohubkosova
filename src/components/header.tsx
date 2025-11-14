import HeaderClient from "@/components/header-client"
import { fetchCurrentUserProfile } from "@/services/profile"

async function HeaderServer() {
  const { userProfile } = await fetchCurrentUserProfile()
  const fallbackName = userProfile?.emri_i_plote ?? null
  const fallbackEmail = userProfile?.email ?? null

  return <HeaderClient fallbackUserName={fallbackName} fallbackUserEmail={fallbackEmail} />
}

export function Header() {
  // @ts-expect-error Async Server Component
  return <HeaderServer />
}

export default Header
