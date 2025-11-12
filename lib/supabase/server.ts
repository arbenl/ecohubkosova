import { cookies } from "next/headers"
import { createRouteHandlerClient, createServerActionClient } from "@supabase/auth-helpers-nextjs"

export { createServerSupabaseClient, getServerUser } from "@/src/lib/supabase-server"

// This function creates a Supabase client for Route Handlers (API routes) and Server Actions.
// It also uses cookies to manage the session. We avoid caching so auth cookies
// can be set per-request (important for sign-in/out flows).
export const createRouteHandlerSupabaseClient = () => {
  const cookieStore = cookies()
  return createRouteHandlerClient({ cookies: () => cookieStore })
}

// Server Actions need their own client helper so that auth cookies can be set
// inside action requests (e.g., during sign-in/out flows).
export const createServerActionSupabaseClient = () => {
  return createServerActionClient({ cookies })
}

// Note: createMiddlewareClient is typically used directly within middleware.ts
// and doesn't usually need to be exported from a central utility file like this.
// We will address middleware in the next step.
