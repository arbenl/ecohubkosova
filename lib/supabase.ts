import { createBrowserClient } from "@supabase/ssr"

// Create singleton instance - only initialize once
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseClient() {
  // Return existing instance if it exists
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Create new instance only if it doesn't exist
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: "eco-hub-auth",
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    },
  )

  return supabaseInstance
}

// Export the singleton instance
export const supabase = createSupabaseClient()
