import { logAuthAction } from "@/lib/auth/logging"
import type { UserProfile } from "@/types"

const PROFILE_FETCH_TIMEOUT = 5000
const MAX_PROFILE_RETRIES = 2

export class ProfileManager {
  private profileFetchAbortRef: React.MutableRefObject<AbortController | null>

  constructor(abortRef: React.MutableRefObject<AbortController | null>) {
    this.profileFetchAbortRef = abortRef
  }

  async fetchUserProfile(userId: string, attempt: number = 1): Promise<UserProfile | null> {
    try {
      if (this.profileFetchAbortRef.current) {
        this.profileFetchAbortRef.current.abort()
      }

      const abortController = new AbortController()
      this.profileFetchAbortRef.current = abortController

      const timeout = setTimeout(() => abortController.abort(), PROFILE_FETCH_TIMEOUT)

      try {
        const response = await fetch("/api/auth/profile", {
          cache: "no-store",
          signal: abortController.signal,
        })

        clearTimeout(timeout)

        const payload = await response.json().catch(() => null)

        if (!response.ok) {
          // Don't retry on 401 (Unauthorized) or 5xx (Server Errors)
          if (response.status === 401 || response.status >= 500) {
            throw new Error(payload?.error || `HTTP ${response.status}`)
          }

          // Retry on other client/temporary errors (4xx except 401, network issues)
          if (attempt < MAX_PROFILE_RETRIES) {
            logAuthAction("fetchUserProfile", `Retry attempt ${attempt + 1}`, {
              userId,
              status: response.status,
            })

            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
            return this.fetchUserProfile(userId, attempt + 1)
          }

          throw new Error(payload?.error || `HTTP ${response.status}`)
        }

        return (payload?.profile ?? null) as UserProfile | null
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          logAuthAction("fetchUserProfile", "Profile fetch timeout", { userId })
          return null
        }
        throw fetchError
      }
    } catch (error) {
      logAuthAction("fetchUserProfile", `Error on attempt ${attempt}`, {
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  }

  cleanup() {
    if (this.profileFetchAbortRef.current) {
      this.profileFetchAbortRef.current.abort()
    }
  }
}
