import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export { createCachedServerSupabaseClient, getServerUser } from "@/lib/supabase-server"

/**
 * Creates a Supabase client for Route Handlers (API routes) and Server Actions.
 * Uses cookies to manage the session without caching to ensure auth cookies
 * can be set per-request (important for sign-in/out/auth flows).
 *
 * @returns Promise<SupabaseClient>
 *
 * Usage:
 * - Route Handlers (API routes)
 * - Server Actions
 * - Route handlers that need fresh auth state
 */
export const createServerSupabaseClient = async () => {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware handling cookie setting.
          }
        },
      },
    }
  )
}

/**
 * Deprecated: Use createServerSupabaseClient instead.
 * Kept for backward compatibility with Route Handlers.
 * @deprecated Use createServerSupabaseClient
 */
export const createRouteHandlerSupabaseClient = createServerSupabaseClient

/**
 * Deprecated: Use createServerSupabaseClient instead.
 * Kept for backward compatibility with Server Actions.
 * @deprecated Use createServerSupabaseClient
 */
export const createServerActionSupabaseClient = createServerSupabaseClient
