import { logAuthAction } from "@/lib/auth/logging"

export class SessionExpirationHandler {
  private resetAuthState: () => void
  private startTransition: (callback: () => void) => void

  constructor(
    resetAuthState: () => void,
    startTransition: (callback: () => void) => void
  ) {
    this.resetAuthState = resetAuthState
    this.startTransition = startTransition
  }

  handleSessionExpired(searchParams: URLSearchParams) {
    if (searchParams.get("session_expired") === "true") {
      logAuthAction("sessionExpired", "Session expired detected in URL params")
      this.startTransition(() => {
        this.resetAuthState()
      })
      return true
    }
    return false
  }
}
