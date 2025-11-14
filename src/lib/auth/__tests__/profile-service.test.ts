import { beforeEach, describe, expect, it, vi } from "vitest"

const dbMocks = vi.hoisted(() => {
  const state = {
    selectRows: [] as any[],
    insertRows: [] as any[],
  }

  const selectChain = {
    from: vi.fn(() => selectChain),
    where: vi.fn(() => selectChain),
    limit: vi.fn(() => Promise.resolve(state.selectRows)),
  }

  const insertChain = {
    values: vi.fn(() => insertChain),
    returning: vi.fn(() => Promise.resolve(state.insertRows)),
  }

  const client = {
    select: vi.fn(() => selectChain),
    insert: vi.fn(() => insertChain),
  }

  return { state, client }
})

vi.mock("@/lib/drizzle", () => ({
  db: {
    get: () => dbMocks.client,
  },
}))

const supabase = {
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "user-1", email: "user@example.com", user_metadata: { full_name: "User One", location: "" } } }, error: null })),
  },
}

import { ensureUserProfileExists } from "../profile-service"

describe("ensureUserProfileExists", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbMocks.state.selectRows = [
      {
        id: "user-1",
        emri_i_plote: "User One",
        email: "user@example.com",
        vendndodhja: "",
        roli: "Individ",
        eshte_aprovuar: true,
        created_at: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]
    dbMocks.state.insertRows = []
  })

  it("returns existing profile", async () => {
    const profile = await ensureUserProfileExists(supabase as any, "user-1")
    expect(profile?.id).toBe("user-1")
    expect(dbMocks.client.insert).not.toHaveBeenCalled()
  })

  it("creates profile when missing", async () => {
    dbMocks.state.selectRows = []
    dbMocks.state.insertRows = [
      {
        id: "user-1",
        emri_i_plote: "User",
        email: "user@example.com",
        vendndodhja: "",
        roli: "Individ",
        eshte_aprovuar: false,
        created_at: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]

    const profile = await ensureUserProfileExists(supabase as any, "user-1")
    expect(dbMocks.client.insert).toHaveBeenCalled()
    expect(profile?.id).toBe("user-1")
  })

  it("propagates supabase errors", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error("boom"),
    })

    await expect(ensureUserProfileExists(supabase as any, "user-1")).rejects.toThrow("boom")
  })
})
