import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql, eq } from "drizzle-orm"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { db } from "@/lib/drizzle"
import { users } from "@/db/schema"
import { SESSION_VERSION_COOKIE, SESSION_VERSION_COOKIE_OPTIONS } from "@/lib/auth/session-version"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo =
    requestUrl.searchParams.get("redirectedFrom") ??
    requestUrl.searchParams.get("next") ??
    "/dashboard"

  const cookieStore = cookies()

  if (code) {
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.id) {
      const [updated] = await db
        .get()
        .update(users)
        .set({ session_version: sql<number>`${users.session_version} + 1` })
        .where(eq(users.id, user.id))
        .returning({ sessionVersion: users.session_version })

      const version = updated?.sessionVersion ?? 1
      cookieStore.set(SESSION_VERSION_COOKIE, String(version), SESSION_VERSION_COOKIE_OPTIONS)
    }
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
}
