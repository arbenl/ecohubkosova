import { redirect } from "next/navigation"
import type { SupabaseClient } from "@supabase/supabase-js"

const UNAUTHORIZED_MESSAGE = "Nuk jeni i autorizuar të kryeni këtë veprim."

type AnySupabaseClient = SupabaseClient<any, any, any>

/**
 * Ensures the current session belongs to an Admin by inspecting the canonical
 * `public.users` record instead of trusting user_metadata.
 */
export async function requireAdminRole<T extends AnySupabaseClient>(supabase: T) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/kycu?message=Ju duhet të kyçeni për të vazhduar.")
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("roli")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.roli !== "Admin") {
    redirect(`/auth/kycu?message=${encodeURIComponent(UNAUTHORIZED_MESSAGE)}`)
  }

  return { user, role: profile.roli }
}
