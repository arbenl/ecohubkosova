import type { MutableRefObject } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { logAuthAction } from "@/lib/auth/logging"

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
      resetAuthState()
      router.replace("/auth/kycu")
      router.refresh()

      try {
        await supabase.auth.signOut({ scope: "local" })
        logAuthAction("signOut", "Client-side sign-out successful")
      } catch (error) {
        logAuthAction("signOut", "Client-side sign-out error (non-fatal)", {
          error: error instanceof Error ? error.message : String(error),
        })
      }

      try {
        const response = await fetch("/api/auth/signout", {
          method: "POST",
          cache: "no-store",
          credentials: "include",
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error ?? "Nuk u arrit dalja nga llogaria.")
        }

        logAuthAction("signOut", "Server-side sign-out successful")
      } catch (error) {
        logAuthAction("signOut", "Server-side sign-out error (non-fatal)", {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    } finally {
      signOutInFlightRef.current = false
      setSignOutPending(false)
    }
  }
}
