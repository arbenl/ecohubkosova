"use client"

import type React from "react"
import { useState, useEffect, useCallback, useContext, createContext, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import type { User, AuthChangeEvent, AuthResponse, SignInWithPasswordCredentials } from "@supabase/supabase-js"
import { createClientSupabaseClient } from "@/lib/supabase"
import { createSignOutHandler } from "@/lib/auth/signout-handler"
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

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [signOutPending, setSignOutPending] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const signOutInFlightRef = useRef(false)

  const resetAuthState = useCallback(() => {
    setUser(null)
    setUserProfile(null)
    setIsAdmin(false)
    setIsLoading(false)
  }, [])

  const fetchUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const response = await fetch("/api/auth/profile", { cache: "no-store" })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || "Nuk u gjet profili i përdoruesit.")
      }

      return (payload?.profile ?? null) as UserProfile | null
    } catch (error) {
      console.error("Dështoi marrja e profilit:", error)
      return null
    }
  }, [])

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile()
      setUserProfile(profile)
      setIsAdmin(profile?.roli === "Admin")
    }
  }

  const hydrateUser = useCallback(
    async (nextUser: User | null) => {
      if (!nextUser) {
        resetAuthState()
        return
      }

      setUser(nextUser)

      try {
        const profile = await fetchUserProfile()
        setUserProfile(profile)
        setIsAdmin(profile?.roli === "Admin")
      } catch (error) {
        console.error("Dështoi rifreskimi i profilit:", error)
        setUserProfile(null)
        setIsAdmin(false)
      }
    },
    [fetchUserProfile, resetAuthState]
  )

  const primeUser = useCallback(async () => {
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
      console.error("Dështoi verifikimi i përdoruesit:", error)
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
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent) => {
      if (!active) return

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        await hydrateUser(user ?? null)
      } catch (error) {
        console.error("Dështoi sinkronizimi i përdoruesit pas ndryshimit:", error)
        await hydrateUser(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [hydrateUser, supabase, primeUser])

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
      console.error("Sign in error:", error)
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
