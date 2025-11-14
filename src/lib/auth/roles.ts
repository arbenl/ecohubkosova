import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { getServerUser, createServerSupabaseClient } from "@/lib/supabase/server"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"

const UNAUTHORIZED_MESSAGE = "Nuk jeni i autorizuar të kryeni këtë veprim."

/**
 * Ensures the current session belongs to an Admin by inspecting the canonical
 * `public.users` record instead of trusting user_metadata.
 */
export async function requireAdminRole() {
  const { user, error: authError } = await getServerUser()

  if (authError || !user) {
    redirect("/auth/kycu?message=Ju duhet të kyçeni për të vazhduar.")
  }

  let role: string | null = null

  try {
    const [profile] = await db
      .get()
      .select({ roli: users.roli })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    role = profile?.roli ?? null
  } catch (error) {
    console.warn("[requireAdminRole] Drizzle role lookup failed; falling back to Supabase REST.", error)
    role = await fetchRoleViaSupabase(user.id)
  }

  if (role !== "Admin") {
    redirect(`/auth/kycu?message=${encodeURIComponent(UNAUTHORIZED_MESSAGE)}`)
  }

  return { user, role }
}

async function fetchRoleViaSupabase(userId: string): Promise<string | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from("users").select("roli").eq("id", userId).single()

  if (error) {
    console.error("[requireAdminRole] Supabase fallback failed:", error)
    return null
  }

  return (data as { roli?: string } | null)?.roli ?? null
}
