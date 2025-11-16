import { logAuthAction } from "@/lib/auth/logging"
import type { UserProfile } from "@/types"

const PROFILE_FETCH_TIMEOUT = 5000
const MAX_PROFILE_RETRIES = 2

export interface ProfileFetchResult {
  profile: UserProfile | null
  dbUnavailable: boolean
  error?: string
}

export class ProfileManager {
  private profileFetchAbortRef: React.MutableRefObject<AbortController | null>

  constructor(abortRef: React.MutableRefObject<AbortController | null>) {
    this.profileFetchAbortRef = abortRef
  }

  async fetchUserProfile(
    userId: string,
    attempt: number = 1
  ): Promise<ProfileFetchResult> {
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
          // Check if database is unavailable
          if (payload?.dbUnavailable) {
            logAuthAction("fetchUserProfile", "Database unavailable", { userId })
            return {
              profile: null,
              dbUnavailable: true,
              error: payload?.error,
            }
          }

          // Don't retry on 401 (Unauthorized)
          if (response.status === 401) {
            throw new Error(payload?.error || `HTTP ${response.status}`)
          }

          // Retry on 5xx errors up to MAX_PROFILE_RETRIES times
          if (response.status >= 500 && attempt < MAX_PROFILE_RETRIES) {
            logAuthAction("fetchUserProfile", `Retry attempt ${attempt + 1}`, {
              userId,
              status: response.status,
            })

            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
            return this.fetchUserProfile(userId, attempt + 1)
          }

          throw new Error(payload?.error || `HTTP ${response.status}`)
        }

        return {
          profile: (payload?.profile ?? null) as UserProfile | null,
          dbUnavailable: payload?.dbUnavailable || false,
        }
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          logAuthAction("fetchUserProfile", "Profile fetch timeout", { userId })
          return {
            profile: null,
            dbUnavailable: false,
            error: "Request timeout",
          }
        }
        throw fetchError
      }
    } catch (error) {
      logAuthAction("fetchUserProfile", `Error on attempt ${attempt}`, {
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      return {
        profile: null,
        dbUnavailable: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  cleanup() {
    if (this.profileFetchAbortRef.current) {
      this.profileFetchAbortRef.current.abort()
    }
  }
}
