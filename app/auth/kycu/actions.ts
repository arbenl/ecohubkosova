"use server"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(email: string, password: string) {
  const supabase = createRouteHandlerSupabaseClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign in error:", error)
    return { error: error.message }
  }

  redirect("/dashboard")
}
