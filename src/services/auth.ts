/**
 * Shared authentication service for common operations.
 * Centralizes auth logic to reduce duplication between login and register pages.
 */

import { createServerActionSupabaseClient } from "@/lib/supabase/server"
import { logAuthAction } from "@/lib/auth/logging"

export type AuthResponse = {
  success?: boolean
  message?: string
  error?: string
  redirectUrl?: string
  data?: any
}

/**
 * Validates auth credentials and logs the attempt
 */
export async function validateAuthCredentials(email: string, password: string, schema: any) {
  const parsed = schema.safeParse({
    email,
    password,
  })

  if (!parsed.success) {
    logAuthAction("auth", "Validation failed", {
      email,
      errors: parsed.error.errors.map((e: any) => e.message),
    })
    return {
      error: parsed.error.errors[0]?.message ?? "Të dhëna të pavlefshme.",
    }
  }

  return { data: parsed.data }
}

/**
 * Handles Supabase sign-in with error logging
 */
export async function handleSupabaseSignIn(email: string, password: string): Promise<AuthResponse> {
  const supabase = await createServerActionSupabaseClient()

  logAuthAction("signIn", "Attempting sign-in", { email })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    logAuthAction("signIn", "Authentication failed", {
      email,
      error: error.message,
    })
    return { error: error.message || "Kyçja dështoi. Përpiquni më vonë." }
  }

  if (!data.session) {
    logAuthAction("signIn", "No session created", { email })
    return { error: "Sesioni nuk u krijua. Përpiquni më vonë." }
  }

  logAuthAction("signIn", "Sign-in successful", { email })
  return { success: true }
}

/**
 * Handles Supabase sign-up with error logging
 */
export async function handleSupabaseSignUp(
  email: string,
  password: string,
  userData: Record<string, any>
): Promise<AuthResponse> {
  const supabase = await createServerActionSupabaseClient()

  logAuthAction("signUp", "Attempting sign-up", { email })

  const { data: signUpData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })

  if (authError) {
    logAuthAction("signUp", "Sign-up failed", {
      email,
      error: authError.message,
    })

    if (authError.message.includes("User already registered")) {
      return { error: "Ky email është i regjistruar më parë." }
    }
    return { error: authError.message || "Regjistrimi dështoi. Përpiquni më vonë." }
  }

  if (!signUpData.user) {
    return { error: "Nuk pati përgjigje të vlefshme nga serveri. Përpiquni më vonë." }
  }

  logAuthAction("signUp", "Sign-up successful", { email, userId: signUpData.user.id })
  return { success: true, data: signUpData }
}

/**
 * Sets session cookie for auth persistence
 */
export async function setSessionCookie(session: any) {
  const cookieStore = await import("next/headers").then((m) => m.cookies())
  const { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_OPTIONS } = await import(
    "@/lib/auth/session-version"
  )

  const cookie = await cookieStore
  if (session?.access_token) {
    cookie.set(SESSION_VERSION_COOKIE, "1", SESSION_VERSION_COOKIE_OPTIONS)
  }
}
