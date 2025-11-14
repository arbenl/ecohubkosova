import type { MutableRefObject } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

interface SignOutDeps {
  supabase: SupabaseClient<any, any, any>
  router: AppRouterInstance
  resetAuthState: () => void
  signOutInFlightRef: MutableRefObject<boolean>
  setSignOutPending: (value: boolean) => void
}

export function createSignOutHandler({ supabase, router, resetAuthState, signOutInFlightRef, setSignOutPending }: SignOutDeps) {
  return async function signOut() {
    if (signOutInFlightRef.current) {
      return
    }

    signOutInFlightRef.current = true
    setSignOutPending(true)
    resetAuthState()
    router.replace("/auth/kycu")
    router.refresh()

    try {
      await supabase.auth.signOut({ scope: "local" })
    } catch (error) {
      console.error("Local sign-out cleanup error:", error)
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
    } catch (error) {
      console.error("Sign-out error:", error)
    } finally {
      signOutInFlightRef.current = false
      setSignOutPending(false)
    }
  }
}
