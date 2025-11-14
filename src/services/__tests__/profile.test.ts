import { beforeEach, describe, expect, it, vi } from "vitest"

const supabase = {
  auth: {
    getUser: vi.fn(),
  },
}

const mocks = vi.hoisted(() => {
  const state = {
    selectResponses: [] as Array<{ rows: any[]; error?: Error }>,
  }

  const buildQuery = () => {
    const builder: any = {
      select: vi.fn(() => builder),
      from: vi.fn(() => builder),
      where: vi.fn(() => builder),
      leftJoin: vi.fn(() => builder),
      limit: vi.fn(() => {
        const response = state.selectResponses.shift() ?? { rows: [] }
        if (response.error) {
          return Promise.reject(response.error)
        }
        return Promise.resolve(response.rows)
      }),
    }
    return builder
  }

  const get = vi.fn(() => buildQuery())

  return { state, get }
})

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => supabase,
}))

vi.mock("@/lib/drizzle", () => ({
  db: {
    get: () => mocks.get(),
  },
}))

vi.mock("next/cache", () => ({
  unstable_noStore: () => () => {},
}))

import {
  ensureUserOrganizationMembership,
  fetchCurrentUserProfile,
  fetchUserProfileById,
} from "../profile"

describe("services/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state.selectResponses = []
  })

  it("fetches current user profile and organization", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null })
    mocks.state.selectResponses = [
      { rows: [{ id: "user-1", emri_i_plote: "John", email: "john@example.com", vendndodhja: "Prishtina", roli: "OJQ", eshte_aprovuar: true, created_at: new Date("2024-01-01T00:00:00.000Z") }] },
      { rows: [{ organization_id: "org-1" }] },
      { rows: [{ id: "org-1", emri: "Org", pershkrimi: "Desc", interesi_primar: "Green", person_kontakti: "Jane", email_kontakti: "jane@example.com", vendndodhja: "Prishtina", lloji: "OJQ", eshte_aprovuar: true }] },
    ]

    const result = await fetchCurrentUserProfile()
    expect(result.userProfile?.id).toBe("user-1")
    expect(result.organization?.id).toBe("org-1")
  })

  it("returns error when not authenticated", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

    const result = await fetchCurrentUserProfile()
    expect(result.error).toBe("Përdoruesi nuk është i kyçur.")
  })

  it("fetches user profile by id", async () => {
    mocks.state.selectResponses = [
      { rows: [{ id: "user-2", emri_i_plote: "Jane", email: "jane@example.com", vendndodhja: "Prizren", roli: "Individ", eshte_aprovuar: true, created_at: new Date("2024-01-01T00:00:00.000Z") }] },
    ]

    const result = await fetchUserProfileById("user-2")
    expect(result.userProfile?.id).toBe("user-2")
  })

  it("ensures organization membership using drizzle", async () => {
    mocks.state.selectResponses = [{ rows: [{ id: "membership-1" }] }]
    const resp = await ensureUserOrganizationMembership("org-1", "user-1")
    expect(resp.isMember).toBe(true)

    mocks.state.selectResponses = [{ rows: [] }]
    const noMember = await ensureUserOrganizationMembership("org-1", "user-1")
    expect(noMember.isMember).toBe(false)
  })
})
