import { redirect } from "@/i18n/routing"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { getServerUser } from "@/lib/supabase/server"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
import type { Locale } from "@/lib/locales"

const UNAUTHORIZED_MESSAGE = "Nuk jeni i autorizuar të kryeni këtë veprim."

/**
 * Extracts the current locale from the request.
 * Used for locale-aware redirects.
 */
export async function getCurrentLocale(): Promise<Locale> {
  const headersList = await headers()
  // Next.js sets x-pathname header with the full pathname
  const pathname = headersList.get("x-pathname") || ""
  const match = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  return (match?.[1] as Locale) || "sq"
}

/**
 * Ensures the current session belongs to an Admin by inspecting the canonical
 * `public.users` record instead of trusting user_metadata.
 */
export async function requireAdminRole() {
  const { user, error: authError } = await getServerUser()
  const locale = await getCurrentLocale()

  if (authError || !user) {
    redirect({ href: `/login?message=Ju duhet të kyçeni për të vazhduar.`, locale })
  }

  const records = await db.get().select().from(users).where(eq(users.id, user!.id)).limit(1)
  const userRecord = records[0]

  if (!userRecord) {
    redirect({ href: `/login?message=${encodeURIComponent(UNAUTHORIZED_MESSAGE)}`, locale })
  }

  if (userRecord.role !== "Admin") {
    redirect({ href: `/login?message=${encodeURIComponent(UNAUTHORIZED_MESSAGE)}`, locale })
  }

  return {
    user,
    role: userRecord.role,
    id: userRecord.id,
    email: userRecord.email,
    fullName: userRecord.full_name,
  }
}
