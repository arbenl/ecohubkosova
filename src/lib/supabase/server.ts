import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export { createServerSupabaseClient, getServerUser } from "@/lib/supabase-server"

// This function creates a Supabase client for Route Handlers (API routes) and Server Actions.
// It also uses cookies to manage the session. We avoid caching so auth cookies
// can be set per-request (important for sign-in/out flows).
export const createRouteHandlerSupabaseClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// Server Actions need their own client helper so that auth cookies can be set
// inside action requests (e.g., during sign-in/out flows).
export const createServerActionSupabaseClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// Note: createMiddlewareClient is typically used directly within middleware.ts
// and doesn't usually need to be exported from a central utility file like this.
// We will address middleware in the next step.
