"use client"

import type React from "react"
import {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  useMemo,
  useRef,
  useTransition,
} from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocale } from "next-intl"
import type { User, AuthResponse, SignInWithPasswordCredentials } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { createClientSupabaseClient } from "@/lib/supabase"
import { createSignOutHandler } from "@/lib/auth/signout-handler"
import { logAuthAction } from "@/lib/auth/logging"
import { ProfileManager } from "@/lib/auth/profile-manager"
import { UserStateManager } from "@/lib/auth/user-state-manager"
import { SupabaseInitializer } from "@/lib/auth/supabase-initializer"
import { SessionExpirationHandler } from "@/lib/auth/session-expiration-handler"
import type { UserProfile } from "@/types"
import type { Locale } from "@/lib/locales"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  signOutPending: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  signInWithPassword: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const SupabaseContext = createContext<SupabaseClient<Database> | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
  initialUser: User | null
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  // State management
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [signOutPending, setSignOutPending] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Navigation and Supabase
  const router = useRouter()
  const locale = useLocale() as Locale
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const [, startTransition] = useTransition()

  // Refs for managing async operations
  const signOutInFlightRef = useRef(false)
  const profileFetchAbortRef = useRef<AbortController | null>(null)
  const hydrationInFlightRef = useRef(false)

  // Initialize managers
  const userStateManager = useMemo(
    () => new UserStateManager(setUser, setUserProfile, setIsLoading, setIsAdmin),
    []
  )

  const profileManager = useMemo(() => new ProfileManager(profileFetchAbortRef), [])

  const supabaseInitializer = useMemo(
    () => new SupabaseInitializer(supabase, profileManager, userStateManager, profileFetchAbortRef),
    [supabase, profileManager, userStateManager]
  )

  const sessionExpirationHandler = useMemo(
    () => new SessionExpirationHandler(() => userStateManager.reset(), startTransition),
    [userStateManager, startTransition]
  )

  // Reset auth state callback
  const resetAuthState = useCallback(() => {
    userStateManager.reset()
  }, [userStateManager])

  // Refresh user profile
  const refreshUserProfile = useCallback(async () => {
    if (user) {
      try {
        logAuthAction("refreshUserProfile", "Refreshing profile", { userId: user.id })
        const profileResult = await profileManager.fetchUserProfile(user.id)
        const fetchedProfile = profileResult.profile
        setUserProfile(fetchedProfile)
        setIsAdmin(fetchedProfile?.role === "Admin")
      } catch (error) {
        logAuthAction("refreshUserProfile", "Error refreshing profile", {
          userId: user.id,
          error: error instanceof Error ? error.message : String(error),
        })
        // Don't throw - just keep existing state
      }
    }
  }, [user, profileManager])

  // Hydrate user from current session
  const hydrateUser = useCallback(
    async (nextUser: User | null) => {
      // Don't hydrate if sign out is in progress
      if (signOutInFlightRef.current) {
        logAuthAction("hydrateUser", "Skipping hydration - sign out in progress")
        return
      }

      if (!nextUser) {
        logAuthAction("hydrateUser", "Clearing user state (no user)")
        userStateManager.reset()
        return
      }

      logAuthAction("hydrateUser", "Hydrating user", { userId: nextUser.id })
      setUser(nextUser)
      setIsLoading(false) // Don't load profile automatically
      userStateManager.hydrateUser(nextUser, null) // No profile

      logAuthAction("hydrateUser", "User hydrated successfully (no profile)", {
        userId: nextUser.id,
      })
    },
    [profileManager, userStateManager, signOutInFlightRef]
  )

  // Prime user on mount
  const primeUser = useCallback(async () => {
    logAuthAction("primeUser", "Priming user on mount")
    setIsLoading(true)
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Auth timeout")), 5000)
      )

      // Race Supabase against the timeout
       
      const {
        data: { user },
        error,
      } = (await Promise.race([
        supabase.auth.getUser(),
        timeoutPromise.then(() => {
          throw new Error("Auth timeout")
        }),
      ])) as any

      if (error) {
        throw error
      }

      await hydrateUser(user ?? null)
    } catch (error) {
      logAuthAction("primeUser", "Error/Timeout during priming", {
        error: error instanceof Error ? error.message : String(error),
      })
      await hydrateUser(null)
    } finally {
      // Always clear loading, even on errors/timeouts
      setIsLoading(false)
    }
  }, [hydrateUser, supabase])

  // Setup auth state listener on mount
  useEffect(() => {
    let active = true

    primeUser()

    const unsubscribe = supabaseInitializer.setupAuthStateListener(primeUser)

    return () => {
      active = false
      unsubscribe()
      if (profileFetchAbortRef.current) {
        profileFetchAbortRef.current.abort()
      }
    }
  }, [supabaseInitializer, primeUser])

  // Handle session expiration
  useEffect(() => {
    sessionExpirationHandler.handleSessionExpired(searchParams)
  }, [searchParams, sessionExpirationHandler])

  // Keep server-rendered routes in sync with auth changes
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        try {
          router.refresh()
        } catch (e) {
          // ignore refresh errors in client
        }
      }
    })

    return () => {
      if (data?.subscription) {
        data.subscription.unsubscribe()
      }
    }
  }, [supabase, router])

  // Create sign out function
  const signOut = useMemo(
    () =>
      createSignOutHandler({
        supabase,
        router,
        locale,
        resetAuthState,
        signOutInFlightRef,
        setSignOutPending,
      }),
    [supabase, router, locale, resetAuthState]
  )

  // Sign in with password
  const signInWithPassword = async (credentials: SignInWithPasswordCredentials) => {
    try {
      const response = await supabase.auth.signInWithPassword(credentials)
      if (response.error) {
        throw response.error
      }
      return response
    } catch (error) {
      logAuthAction("signInWithPassword", "Error", {
        credential: "email" in credentials ? credentials.email : credentials.phone,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  // Build context value
  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    signOutPending,
    isAdmin,
    signOut,
    signInWithPassword,
    refreshUserProfile,
  }

  return (
    <SupabaseContext.Provider value={supabase}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </SupabaseContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error("useSupabase must be used within an AuthProvider")
  }
  return context
}
