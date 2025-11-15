"use server"

import { redirect } from "next/navigation"
import { headers, cookies } from "next/headers"
import { sql, eq } from "drizzle-orm"
import { createServerActionSupabaseClient } from "@/lib/supabase/server"
import { loginSchema } from "@/validation/auth"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
import { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_OPTIONS } from "@/lib/auth/session-version"

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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign in error:", error)
    return {
      message: error.message,
    }
  }

  const userId = data.user?.id

  if (!userId) {
    return {
      message: "Përdoruesi nuk u gjet pas kyçjes.",
    }
  }

  const [updated] = await db
    .get()
    .update(users)
    .set({ session_version: sql<number>`${users.session_version} + 1` })
    .where(eq(users.id, userId))
    .returning({ sessionVersion: users.session_version })

  const version = updated?.sessionVersion ?? 1
  const cookieStore = cookies()
  cookieStore.set(SESSION_VERSION_COOKIE, String(version), SESSION_VERSION_COOKIE_OPTIONS)

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
