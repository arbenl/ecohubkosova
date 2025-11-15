import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function HomeRedirect() {
  if (process.env.NEXT_PUBLIC_FORCE_DEV_SIGNOUT === "true") {
    try {
      const supabase = createServerSupabaseClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Failed to auto sign out on home redirect:", error)
    }
  }

  redirect("/auth/kycu")
}
