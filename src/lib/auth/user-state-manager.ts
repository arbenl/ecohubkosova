import type { User } from "@supabase/supabase-js"
import { logAuthAction } from "@/lib/auth/logging"
import type { UserProfile } from "@/types"

export interface UserState {
  user: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  isAdmin: boolean
}

export class UserStateManager {
  setUser: (user: User | null) => void
  setUserProfile: (profile: UserProfile | null) => void
  setIsLoading: (loading: boolean) => void
  setIsAdmin: (admin: boolean) => void

  constructor(
    setUser: (user: User | null) => void,
    setUserProfile: (profile: UserProfile | null) => void,
    setIsLoading: (loading: boolean) => void,
    setIsAdmin: (admin: boolean) => void
  ) {
    this.setUser = setUser
    this.setUserProfile = setUserProfile
    this.setIsLoading = setIsLoading
    this.setIsAdmin = setIsAdmin
  }

  reset() {
    logAuthAction("userStateManager", "Resetting user state")
    this.setUser(null)
    this.setUserProfile(null)
    this.setIsAdmin(false)
    this.setIsLoading(false)
  }

  hydrateUser(nextUser: User | null, profile: UserProfile | null) {
    this.setUser(nextUser)
    this.setUserProfile(profile)
    this.setIsAdmin(profile?.roli === "Admin" || false)
    this.setIsLoading(false)
  }

  clearUser() {
    this.setUser(null)
    this.setUserProfile(null)
    this.setIsAdmin(false)
  }
}
