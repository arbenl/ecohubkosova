// Login server action for handling user authentication
"use server"

import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { loginSchema } from "@/validation/auth"
import { incrementSessionVersion } from "@/services/session"
import { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_OPTIONS } from "@/lib/auth/session-version"
import { logAuthAction } from "@/lib/auth/logging"

type SessionTokens = {
  access_token: string
  refresh_token: string
}

// Type definitions for server action responses
export type SignInResponse =
  | {
      success: true
      session?: SessionTokens
      message?: undefined
      error?: undefined
      redirectUrl?: undefined
    }
  | { message: string; success?: undefined; error?: undefined; redirectUrl?: undefined }
  | { error: string; message?: undefined; success?: undefined; redirectUrl?: undefined }

export type SignInWithGoogleResponse =
  | { redirectUrl: string; error?: undefined }
  | { error: string; redirectUrl?: undefined }

export async function signIn(prevState: any, formData: FormData): Promise<SignInResponse> {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")

  logAuthAction("signIn", "Login attempt", { email })

  const supabase = await createServerSupabaseClient()

  const parsed = loginSchema.safeParse({
    email,
    password,
  })

  if (!parsed.success) {
    logAuthAction("signIn", "Validation failed", {
      email,
      errors: parsed.error.errors.map((e) => e.message),
    })
    return { message: parsed.error.errors[0]?.message ?? "Të dhëna të pavlefshme." }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    logAuthAction("signIn", "Authentication failed", {
      email,
      error: error.message,
    })
    // Use generic error message to prevent email enumeration attacks
    return {
      message: "Email ose fjalekalim i gabuar. Ju lutemi provoni perseri.",
    }
  }

  const userId = data.user?.id

  if (!userId) {
    logAuthAction("signIn", "No user ID after successful auth", { email })
    return {
      message: "Përdoruesi nuk u gjet pas kyçjes.",
    }
  }

  const newVersion = await incrementSessionVersion(userId)

  if (newVersion !== null) {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_VERSION_COOKIE, String(newVersion), SESSION_VERSION_COOKIE_OPTIONS)

    logAuthAction("signIn", "Login successful with session versioning", {
      userId,
      email,
      sessionVersion: newVersion,
    })
  } else {
    logAuthAction("signIn", "Login successful (session versioning unavailable)", {
      userId,
      email,
    })
  }

  // Return success and session tokens so client can set the session and trigger onAuthStateChange
  const sessionTokens =
    data.session?.access_token && data.session.refresh_token
      ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }
      : undefined

  return { success: true, session: sessionTokens }
}

export async function signInWithGoogle(): Promise<SignInWithGoogleResponse> {
  logAuthAction("signInWithGoogle", "OAuth login initiated")

  const supabase = await createServerSupabaseClient()

  // Use hardcoded site URL to prevent open redirect vulnerability
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!redirectUrl) {
    logAuthAction("signInWithGoogle", "Missing NEXT_PUBLIC_SITE_URL environment variable")
    return { error: "Konfigurimi i shërbimit nuk është i saktë. Kontaktoni suportën." }
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${redirectUrl}/auth/callback`,
    },
  })

  if (error) {
    logAuthAction("signInWithGoogle", "OAuth initiation failed", {
      error: error.message,
    })
    return { error: error.message }
  }

  return { redirectUrl: data.url }
}
