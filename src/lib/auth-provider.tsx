"use client"

import type React from "react"
import { useState, useEffect, useCallback, useContext, createContext, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Session, User, AuthChangeEvent, AuthResponse, SignInWithPasswordCredentials } from "@supabase/supabase-js"
import { createClientSupabaseClient } from "@/lib/supabase"
import { createSignOutHandler } from "@/lib/auth/signout-handler"
import type { UserProfile } from "@/types"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  isLoading: boolean
  signOutPending: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  signInWithPassword: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const SupabaseContext = createContext<ReturnType<typeof createClientSupabaseClient> | null>(null)

export function AuthProvider({
  children,
  initialSession,
  initialUser,
}: {
  children: React.ReactNode
  initialSession: Session | null
  initialUser: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser ?? null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(initialSession)
  const [isLoading, setIsLoading] = useState(true)
  const [signOutPending, setSignOutPending] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const signOutInFlightRef = useRef(false)

  const resetAuthState = useCallback(() => {
    setUser(null)
    setSession(null)
    setUserProfile(null)
    setIsAdmin(false)
    setIsLoading(false)
  }, [])

  const fetchUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const response = await fetch("/api/auth/profile", { cache: "no-store" })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "Nuk u gjet profili i përdoruesit.")
      }
      const payload = (await response.json()) as { profile: UserProfile | null }
      return payload.profile
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

  useEffect(() => {
    let active = true

    const primeSession = async () => {
      setIsLoading(true)
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!active) return

        if (sessionError) {
          throw sessionError
        }

        setSession(session ?? null)

        if (!session) {
          await hydrateUser(null)
          return
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        await hydrateUser(user ?? null)
      } catch (error) {
        if (!active) return
        console.error("Dështoi verifikimi i sesionit:", error)
        await hydrateUser(null)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    primeSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, newSession: Session | null) => {
      if (!active) return

      setSession(newSession)

      if (!newSession) {
        await hydrateUser(null)
        return
      }

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
        console.error("Dështoi sinkronizimi i sesionit pas ndryshimit:", error)
        await hydrateUser(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [hydrateUser, supabase])

  const signOut = useMemo(
    () =>
      createSignOutHandler({
        supabase,
        router,
        resetAuthState,
        signOutInFlightRef,
        setSignOutPending,
      }),
    [supabase, router, resetAuthState, setSignOutPending]
  )

  const signInWithPassword = async (credentials: SignInWithPasswordCredentials) => {
    try {
      const response = await supabase.auth.signInWithPassword(credentials)
      if (response.error) {
        throw response.error
      }
      // The onAuthStateChange listener will handle the user and session update.
      return response
    } catch (error) {
      console.error("Sign in error:", error)
      // Re-throw the error to be handled by the caller
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    session,
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
