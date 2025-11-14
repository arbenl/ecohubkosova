"use server"

import { redirect } from "next/navigation"
import { createServerActionSupabaseClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { loginSchema } from "@/validation/auth"

export async function signIn(prevState: any, formData: FormData) {
  const supabase = createServerActionSupabaseClient()

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { message: parsed.error.errors[0]?.message ?? "Të dhëna të pavlefshme." }
  }

  const { email, password } = parsed.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign in error:", error)
    return {
      message: error.message,
    }
  }

  return redirect("/dashboard")
}

export async function signInWithGoogle() {
  const supabase = createServerActionSupabaseClient()
  const origin = headers().get("origin")

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Sign in with Google error:", error)
    return redirect(`/auth/kycu?message=${error.message}`)
  }

  return redirect(data.url)
}
