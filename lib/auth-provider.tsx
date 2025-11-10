"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  id: string
  emri_i_plotë: string
  email: string
  roli: string
  eshte_aprovuar: boolean
}

type AuthContextType = {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // Add 5 second timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Database timeout")), 5000))

      const queryPromise = supabase.from("users").select("*").eq("id", userId).limit(1).maybeSingle()

      const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as any

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
  }

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id)
      setUserProfile(profile)
      setIsAdmin(profile?.roli === "Admin")
    }
  }

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)

          if (initialSession?.user) {
            // Fetch profile in background - don't block loading
            fetchUserProfile(initialSession.user.id)
              .then((profile) => {
                if (mounted) {
                  setUserProfile(profile)
                  setIsAdmin(profile?.roli === "Admin")
                }
              })
              .catch((error) => {
                console.error("Dështoi marrja e profilit në sfond:", error)
              })
          } else {
            setUserProfile(null)
            setIsAdmin(false)
          }
        }
      } catch (error) {
        console.error("Gabim në sesion:", error)
      } finally {
        // ALWAYS clear loading regardless of success/failure
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      if (!mounted) return

      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        // Fetch profile in background
        fetchUserProfile(newSession.user.id)
          .then((profile) => {
            if (mounted) {
              setUserProfile(profile)
              setIsAdmin(profile?.roli === "Admin")
            }
          })
          .catch((error) => {
            console.error("Dështoi marrja e profilit gjatë autentifikimit:", error)
          })

        if (event === "SIGNED_IN") {
          router.push("/dashboard")
        }
      } else {
        if (mounted) {
          setUserProfile(null)
          setIsAdmin(false)
        }

        if (event === "SIGNED_OUT") {
          router.push("/auth/kycu")
        }
      }

      // Always clear loading after auth state change
      if (mounted) {
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

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
      return { error }
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Gabim gjatë daljes:", error)
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useSupabase() {
  return supabase
}
