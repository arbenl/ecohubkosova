import type { SupabaseClient } from "@supabase/supabase-js"
import { logAuthAction } from "@/lib/auth/logging"
import type { UserProfile } from "@/types"
import type { ProfileManager } from "./profile-manager"
import type { UserStateManager } from "./user-state-manager"

export class SupabaseInitializer {
  private supabase: SupabaseClient
  private profileManager: ProfileManager
  private userStateManager: UserStateManager
  private profileFetchAbortRef: React.MutableRefObject<AbortController | null>

  constructor(
    supabase: SupabaseClient,
    profileManager: ProfileManager,
    userStateManager: UserStateManager,
    profileFetchAbortRef: React.MutableRefObject<AbortController | null>
  ) {
    this.supabase = supabase
    this.profileManager = profileManager
    this.userStateManager = userStateManager
    this.profileFetchAbortRef = profileFetchAbortRef
  }

  setupAuthStateListener(primeUserFn: () => Promise<void>) {
    const { data } = this.supabase.auth.onAuthStateChange(
      async (event, session) => {
        logAuthAction("supabaseInitializer", `Auth state changed: ${event}`, {
          hasSession: !!session,
        })

        if (event === "SIGNED_IN" && session?.user) {
          // Fetch profile for newly signed in user
          try {
            const profile = await this.profileManager.fetchUserProfile(session.user.id, 1)
            this.userStateManager.hydrateUser(session.user, profile)
          } catch (error) {
            logAuthAction("supabaseInitializer", "Profile fetch failed on SIGNED_IN", {
              error: error instanceof Error ? error.message : "Unknown error",
            })
            this.userStateManager.hydrateUser(session.user, null)
          }
        } else if (event === "SIGNED_OUT") {
          this.userStateManager.clearUser()
        } else if (event === "TOKEN_REFRESHED") {
          // Session refreshed, run prime logic to ensure data is fresh
          await primeUserFn()
        } else if (event === "USER_UPDATED") {
          // User info updated (e.g., email changed), refresh everything
          if (session?.user) {
            await primeUserFn()
          }
        }
      }
    )

    return () => {
      if (data?.subscription) {
        data.subscription.unsubscribe()
      }
    }
  }
}
