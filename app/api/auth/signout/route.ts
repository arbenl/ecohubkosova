import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
  const supabase = createRouteHandlerSupabaseClient()
  const { error } = await supabase.auth.signOut({ scope: "global" })

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
    response.headers.set("x-supabase-logout-error", error.message)
    return NextResponse.json(
      { success: false, error: error.message },
      {
        status: 500,
        headers: response.headers,
      }
    )
  }

  return response
}
