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
import type { User, AuthChangeEvent, AuthResponse, SignInWithPasswordCredentials } from "@supabase/supabase-js"
import { createClientSupabaseClient } from "@/lib/supabase"
import { createSignOutHandler } from "@/lib/auth/signout-handler"
import { logAuthAction } from "@/lib/auth/logging"
import type { UserProfile } from "@/types"

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
const SupabaseContext = createContext<ReturnType<typeof createClientSupabaseClient> | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
  initialUser: User | null
}

const PROFILE_FETCH_TIMEOUT = 5000
const MAX_PROFILE_RETRIES = 2

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [signOutPending, setSignOutPending] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const signOutInFlightRef = useRef(false)
  const profileFetchAbortRef = useRef<AbortController | null>(null)
  const [, startTransition] = useTransition()

  const resetAuthState = useCallback(() => {
    setUser(null)
    setUserProfile(null)
    setIsAdmin(false)
    setIsLoading(false)
  }, [])

  const fetchUserProfile = useCallback(
    async (userId: string, attempt: number = 1): Promise<UserProfile | null> => {
      try {
        if (profileFetchAbortRef.current) {
          profileFetchAbortRef.current.abort()
        }

        const abortController = new AbortController()
        profileFetchAbortRef.current = abortController

        const timeout = setTimeout(() => abortController.abort(), PROFILE_FETCH_TIMEOUT)

        try {
          const response = await fetch("/api/auth/profile", {
            cache: "no-store",
            signal: abortController.signal,
          })

          clearTimeout(timeout)

          const payload = await response.json().catch(() => null)

          if (!response.ok) {
            if (attempt < MAX_PROFILE_RETRIES && response.status !== 401) {
              logAuthAction("fetchUserProfile", `Retry attempt ${attempt + 1}`, {
                userId,
                status: response.status,
              })

              await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
              return fetchUserProfile(userId, attempt + 1)
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
    },
    []
  )

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      logAuthAction("refreshUserProfile", "Refreshing profile", { userId: user.id })
      const profile = await fetchUserProfile(user.id)
      setUserProfile(profile)
      setIsAdmin(profile?.roli === "Admin")
    }
  }, [user, fetchUserProfile])

  const hydrateUser = useCallback(
    async (nextUser: User | null) => {
      if (!nextUser) {
        logAuthAction("hydrateUser", "Clearing user state (no user)")
        resetAuthState()
        return
      }

      logAuthAction("hydrateUser", "Hydrating user", { userId: nextUser.id })
      setUser(nextUser)
      setIsLoading(true)

      try {
        const profile = await fetchUserProfile(nextUser.id)
        setUserProfile(profile)
        setIsAdmin(profile?.roli === "Admin")

        logAuthAction("hydrateUser", "User hydrated successfully", {
          userId: nextUser.id,
          hasProfile: !!profile,
        })
      } catch (error) {
        logAuthAction("hydrateUser", "Error hydrating user", {
          userId: nextUser.id,
          error: error instanceof Error ? error.message : String(error),
        })
        setUserProfile(null)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    },
    [fetchUserProfile, resetAuthState]
  )

  const primeUser = useCallback(async () => {
    logAuthAction("primeUser", "Priming user on mount")
    setIsLoading(true)
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        throw error
      }

      await hydrateUser(user ?? null)
    } catch (error) {
      logAuthAction("primeUser", "Error during priming", {
        error: error instanceof Error ? error.message : String(error),
      })
      await hydrateUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [hydrateUser, supabase])

  useEffect(() => {
    let active = true

    primeUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      if (!active) return

      logAuthAction("onAuthStateChange", `Auth event: ${event}`, {
        hasSession: !!session,
      })

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        // Force immediate hydration for SIGNED_IN events
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          await hydrateUser(user ?? null)
        } else {
          await hydrateUser(user ?? null)
        }
      } catch (error) {
        logAuthAction("onAuthStateChange", "Error handling auth change", {
          event,
          error: error instanceof Error ? error.message : String(error),
        })
        await hydrateUser(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
      if (profileFetchAbortRef.current) {
        profileFetchAbortRef.current.abort()
      }
    }
  }, [hydrateUser, supabase, primeUser])

  useEffect(() => {
    if (searchParams.get("session_expired") === "true") {
      logAuthAction("sessionExpired", "Session expired detected in URL params")
      startTransition(() => {
        resetAuthState()
      })
    }
  }, [searchParams, resetAuthState, startTransition])

  const signOut = useMemo(
    () =>
      createSignOutHandler({
        supabase,
        router,
        resetAuthState,
        signOutInFlightRef,
        setSignOutPending,
      }),
    [supabase, router, resetAuthState]
  )

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
