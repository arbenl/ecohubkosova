import HeaderClient from "@/components/header-client"
import { fetchCurrentUserProfile } from "@/services/profile"
import { getServerUser } from "@/lib/supabase/server"

/**
 * Server-side header component that loads user profile.
 * 
 * Error handling strategy:
 * - no_profile: Normal state for new users, no error logging
 * - database_error: Real DB failures, logged for debugging
 * - Falls back to email username when profile unavailable
 */
async function HeaderServer() {
  // First, check if there is an authenticated user
  const { user } = await getServerUser()

  let userProfile = null

  if (user) {
    const result = await fetchCurrentUserProfile()

    if (result.errorType === "none" && result.userProfile) {
      userProfile = result.userProfile
    } else if (result.errorType === "no_profile") {
      // Normal state for new users - no need to log
      // Profile will be created by handle_new_user trigger or on first access
    }
  }

  const fallbackName = userProfile?.full_name ?? user?.email?.split("@")[0] ?? null
  const fallbackEmail = userProfile?.email ?? user?.email ?? null

  return <HeaderClient fallbackUserName={fallbackName} fallbackUserEmail={fallbackEmail} />
}

export function Header() {
  return <HeaderServer />
}

export default Header
