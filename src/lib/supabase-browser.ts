"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

let browserClient: SupabaseClient<Database> | null = null

export const getSupabaseBrowserClient = (): SupabaseClient<Database> => {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    )
  }
  return browserClient
}

// Force reset the browser client - clears all cached session state
export const resetSupabaseBrowserClient = () => {
  browserClient = null
}

