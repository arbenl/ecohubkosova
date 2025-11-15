import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { getServerUser } from "@/lib/supabase/server"
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
    redirect("/login?message=Ju duhet të kyçeni për të vazhduar.")
  }

  const profiles = await db
    .get()
    .select({ roli: users.roli })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)
  const profile = profiles[0]
  const role = profile?.roli ?? null

  if (role !== "Admin") {
    redirect(`/login?message=${encodeURIComponent(UNAUTHORIZED_MESSAGE)}`)
  }

  return { user, role }
}
