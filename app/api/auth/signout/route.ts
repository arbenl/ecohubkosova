import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerSupabaseClient({
    cookieOptions: {
      name: "sb-auth-token",
    },
  })
  const { error } = await supabase.auth.signOut()

  // Always clear the __session cookie ourselves to avoid stale sessions.
  cookieStore.set("__session", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
