"use server"

import { createServerActionSupabaseClient } from "@/lib/supabase/server"
type SignInResult = {
  error: string | null
  session?: {
    access_token: string
    refresh_token: string
  } | null
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const supabase = createServerActionSupabaseClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error)
      return { error: error.message }
    }

    const session = data?.session
      ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }
      : null

    return { error: null, session }
  } catch (error: any) {
    console.error("Server Action Error (signIn):", error)
    return { error: error.message || "Gabim i panjohur gjatë kyçjes." }
  }
}
