import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST() {
  const supabase = createRouteHandlerSupabaseClient()
  const { error } = await supabase.auth.signOut({ scope: "global" })

  const headers = new Headers({
    "Cache-Control": "no-store",
  })

  if (error) {
    headers.set("x-supabase-logout-error", error.message)
  }

  const response = NextResponse.json(
    error ? { success: false, error: error.message } : { success: true },
    {
      status: error ? 500 : 200,
      headers,
    }
  )

  // Ensure the httpOnly cookie is wiped even if Supabase succeeds silently.
  response.cookies.set("__session", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  })

  if (error) {
    response.cookies.set("logout_error", error.message, { path: "/", maxAge: 5 })
  }

  return response
}
