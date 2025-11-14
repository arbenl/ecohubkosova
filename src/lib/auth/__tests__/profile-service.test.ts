import { beforeEach, describe, expect, it, vi } from "vitest"

const profileState = vi.hoisted(() => ({
  maybeSingleResult: { data: null, error: null as Error | null },
  insertResult: { data: null, error: null as Error | null },
  authUser: { user: { id: "user-1", email: "user@example.com", user_metadata: { full_name: "User One" } } },
}))

const usersBuilder = {
  select: vi.fn(() => usersBuilder),
  eq: vi.fn(() => usersBuilder),
  limit: vi.fn(() => usersBuilder),
  maybeSingle: vi.fn(() => Promise.resolve(profileState.maybeSingleResult)),
  insert: vi.fn(() => insertBuilder),
}

const insertBuilder = {
  select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve(profileState.insertResult)) })),
}

const supabase = {
  from: vi.fn(() => usersBuilder),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: profileState.authUser, error: null })),
  },
}

import { ensureUserProfileExists } from "../profile-service"

describe("ensureUserProfileExists", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    profileState.maybeSingleResult = {
      data: {
        id: "user-1",
        emri_i_plote: "User One",
        email: "user@example.com",
        vendndodhja: "",
        roli: "Individ",
        eshte_aprovuar: true,
        created_at: "",
      },
      error: null,
    }
    profileState.insertResult = { data: null, error: null }
    profileState.authUser = { user: { id: "user-1", email: "user@example.com", user_metadata: { full_name: "User" } } }
  })

  it("returns existing profile", async () => {
    const profile = await ensureUserProfileExists(supabase as any, "user-1")
    expect(profile?.id).toBe("user-1")
    expect(usersBuilder.insert).not.toHaveBeenCalled()
  })

  it("creates profile when missing", async () => {
    profileState.maybeSingleResult = { data: null, error: null }
    profileState.insertResult = {
      data: {
        id: "user-1",
        emri_i_plote: "User",
        email: "user@example.com",
        vendndodhja: "",
        roli: "Individ",
        eshte_aprovuar: false,
        created_at: "",
      },
      error: null,
    }

    const profile = await ensureUserProfileExists(supabase as any, "user-1")
    expect(usersBuilder.insert).toHaveBeenCalled()
    expect(profile?.id).toBe("user-1")
  })

  it("propagates supabase errors", async () => {
    profileState.maybeSingleResult = { data: null, error: new Error("boom") }

    await expect(ensureUserProfileExists(supabase as any, "user-1")).rejects.toThrow("boom")
  })
})
