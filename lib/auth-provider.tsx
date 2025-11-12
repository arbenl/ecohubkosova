"use client"

import type React from "react"
import { useState, useEffect, useCallback, useContext, createContext, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Session, User, AuthChangeEvent, AuthError } from "@supabase/supabase-js"
import { createClientSupabaseClient } from "@/lib/supabase"
import type { UserProfile } from "@/types"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
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
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const listenerInitializedRef = useRef(false)
  const signOutInFlightRef = useRef(false)

  const resetAuthState = () => {
    setUser(null)
    setSession(null)
    setUserProfile(null)
    setIsAdmin(false)
  }

  const fetchUserProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", userId).limit(1).maybeSingle()

        if (error) {
          console.error("Gabim në bazën e të dhënave:", error)
          return null
        }

        if (!data) {
          const { data: authUser } = await supabase.auth.getUser()
          if (authUser.user) {
            const newProfile = {
              id: userId,
              emri_i_plotë: authUser.user.user_metadata?.full_name || authUser.user.email?.split("@")[0] || "User",
              email: authUser.user.email || "",
              roli: "Individ",
              eshte_aprovuar: false,
            }

            const { data: createdProfile, error: createError } = await supabase
              .from("users")
              .insert(newProfile)
              .select()
              .single()

            if (createError) {
              console.error("Gabim në krijimin e profilit:", createError)
              return null
            }

            return createdProfile
          }
          return null
        }

        return data
      } catch (error) {
        console.error("Dështoi marrja e profilit:", error)
        return null
      }
    },
    [supabase]
  )

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id)
      setUserProfile(profile)
      setIsAdmin(profile?.roli === "Admin")
    }
  }

  useEffect(() => {
    let mounted = true

    const syncUserState = async (nextUser: User | null) => {
      if (!mounted) return

      if (!nextUser) {
        resetAuthState()
        setIsLoading(false)
        return
      }

      setUser(nextUser)
      setIsLoading(false)
      const profile = await fetchUserProfile(nextUser.id)
      if (!mounted) return
      setUserProfile(profile)
      setIsAdmin(profile?.roli === "Admin")
    }

    void syncUserState(initialUser)

    if (listenerInitializedRef.current) {
      return () => {
        mounted = false
      }
    }

    listenerInitializedRef.current = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      if (!mounted) return

      setSession(newSession)
      const {
        data: { user: authenticatedUser },
      } = await supabase.auth.getUser()

      await syncUserState(authenticatedUser ?? null)

    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      listenerInitializedRef.current = false
    }
  }, [fetchUserProfile, initialUser, supabase])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // If there's an error, clear loading immediately
      if (error) {
        setIsLoading(false)
        return { error }
      }

      return { error: null }
    } catch (error) {
      // Always clear loading on any error
      setIsLoading(false)
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    if (signOutInFlightRef.current) return
    signOutInFlightRef.current = true
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      })

      if (!response.ok) {
        const { error: serverError } = await response.json().catch(() => ({ error: "Gabim gjatë daljes" }))
        throw new Error(serverError || "Gabim gjatë daljes nga serveri")
      }

      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error("Gabim gjatë daljes nga klienti:", error)
      }

      resetAuthState()
      router.replace("/auth/kycu")
      router.refresh()
    } catch (error) {
      console.error("Gabim gjatë daljes:", error)
    } finally {
      signOutInFlightRef.current = false
      setIsLoading(false)
    }
  }

  const value = {
    user,
    userProfile,
    session,
    isLoading,
    isAdmin,
    signIn,
    signOut,
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
