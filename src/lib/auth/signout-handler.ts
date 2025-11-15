import type { MutableRefObject } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { logAuthAction } from "@/lib/auth/logging"
import { resetSupabaseBrowserClient } from "@/lib/supabase-browser"

interface SignOutDeps {
  supabase: SupabaseClient<any, any, any>
  router: AppRouterInstance
  resetAuthState: () => void
  signOutInFlightRef: MutableRefObject<boolean>
  setSignOutPending: (value: boolean) => void
}

export function createSignOutHandler({
  supabase,
  router,
  resetAuthState,
  signOutInFlightRef,
  setSignOutPending,
}: SignOutDeps) {
  return async function signOut() {
    if (signOutInFlightRef.current) {
      logAuthAction("signOut", "Sign-out already in flight - ignoring request")
      return
    }

    signOutInFlightRef.current = true
    setSignOutPending(true)

    logAuthAction("signOut", "Sign-out initiated")

    try {
      // Step 1: Clear client-side auth state first
      try {
        await supabase.auth.signOut({ scope: "local" })
        logAuthAction("signOut", "Client-side sign-out successful")
      } catch (error) {
        logAuthAction("signOut", "Client-side sign-out error (non-fatal)", {
          error: error instanceof Error ? error.message : String(error),
        })
      }

      // Step 2: Reset the browser client singleton to clear cached session
      resetSupabaseBrowserClient()
      logAuthAction("signOut", "Browser client singleton reset")

      // Step 3: Server-side sign-out and cookie cleanup - WAIT for this to complete
      try {
        const response = await fetch("/api/auth/signout", {
          method: "POST",
          cache: "no-store",
          credentials: "include",
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          logAuthAction("signOut", "Server-side sign-out error", {
            status: response.status,
            error: payload?.error,
          })
        } else {
          logAuthAction("signOut", "Server-side sign-out successful")
        }
      } catch (error) {
        logAuthAction("signOut", "Server-side sign-out fetch error (non-fatal)", {
          error: error instanceof Error ? error.message : String(error),
        })
      }

      // Step 3: Give server time to set cookies before navigation
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Step 4: Reset UI state immediately
      resetAuthState()

      // Step 5: Clear the in-flight flag BEFORE navigation to prevent blocking on new page
      signOutInFlightRef.current = false
      setSignOutPending(false)

      // Step 6: Force navigation with window.location.replace for immediate effect
      // This is more reliable than href as it prevents back button issues
      window.location.replace("/auth/kycu")
    } catch (error) {
      logAuthAction("signOut", "Unexpected error during sign-out", {
        error: error instanceof Error ? error.message : String(error),
      })
      signOutInFlightRef.current = false
      setSignOutPending(false)
      // Force navigation even on error
      window.location.replace("/auth/kycu")
    }
  }
}
