import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

interface PageProps {
  params: Promise<{ locale: string }>
}

/**
 * Legacy /dashboard route - redirects to role-appropriate destination.
 * This route exists solely for backward compatibility with old links.
 * It renders NO UI to prevent V1 flicker.
 */
export default async function DashboardRedirectPage({ params }: PageProps) {
  const { locale: localeParam } = await params
  const locale = localeParam || "sq"

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not logged in - redirect to login
  if (!user?.id) {
    redirect(`/${locale}/login`)
  }

  // Fetch role from DB
  let role: string | null = null
  try {
    const result = await db
      .get()
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)
    role = result[0]?.role ?? null
  } catch (error) {
    console.error("[dashboard redirect] failed to load user role", error)
  }

  // Redirect based on role
  const destination = role?.toLowerCase() === "admin" ? `/${locale}/admin` : `/${locale}/my`

  redirect(destination)
}
