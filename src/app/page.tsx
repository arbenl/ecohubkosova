import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_CLEAR_OPTIONS } from "@/lib/auth/session-version"

export default async function HomeRedirect() {
  if (process.env.NEXT_PUBLIC_FORCE_DEV_SIGNOUT === "true") {
    try {
      const supabase = createServerSupabaseClient()
      await supabase.auth.signOut()
      const cookieStore = cookies()
      cookieStore.set(SESSION_VERSION_COOKIE, "", SESSION_VERSION_COOKIE_CLEAR_OPTIONS)
    } catch (error) {
      console.error("Failed to auto sign out on home redirect:", error)
    }
  }

  redirect("/auth/kycu")
}
