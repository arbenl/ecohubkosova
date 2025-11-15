import { describe, expect, it, vi, beforeEach } from "vitest"
import { createSignOutHandler } from "../signout-handler"

const supabase = {
  auth: {
    signOut: vi.fn(() => Promise.resolve()),
  },
}

const router = {
  replace: vi.fn(),
  refresh: vi.fn(),
}

const resetAuthState = vi.fn()
const setSignOutPending = vi.fn()

const signOutInFlightRef = { current: false }

describe("createSignOutHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    signOutInFlightRef.current = false
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({}) })) as any
  })

  it("signs out locally and hits the API", async () => {
    const handler = createSignOutHandler({
      supabase: supabase as any,
      router: router as any,
      resetAuthState,
      signOutInFlightRef,
      setSignOutPending,
    })

    await handler()

    expect(resetAuthState).toHaveBeenCalled()
    expect(router.replace).toHaveBeenCalledWith("/login")
    expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: "local" })
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/signout",
      expect.objectContaining({ method: "POST", credentials: "include" })
    )
    expect(setSignOutPending).toHaveBeenLastCalledWith(false)
  })

  it("guards concurrent sign-outs", async () => {
    const handler = createSignOutHandler({
      supabase: supabase as any,
      router: router as any,
      resetAuthState,
      signOutInFlightRef,
      setSignOutPending,
    })

    signOutInFlightRef.current = true
    await handler()

    expect(supabase.auth.signOut).not.toHaveBeenCalled()
  })
})
