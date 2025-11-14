import { beforeEach, describe, expect, it, vi } from "vitest"

const supabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
}

const builders = {
  users: {
    select: vi.fn(() => builders.users),
    eq: vi.fn(() => builders.users),
    single: vi.fn(),
  },
  orgMembers: {
    select: vi.fn(() => builders.orgMembers),
    eq: vi.fn(() => builders.orgMembers),
    single: vi.fn(),
  },
  organizations: {
    select: vi.fn(() => builders.organizations),
    eq: vi.fn(() => builders.organizations),
    single: vi.fn(),
  },
}

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => supabase,
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
    supabase.from.mockImplementation((table: string) => {
      if (table === "users") return builders.users
      if (table === "organization_members") return builders.orgMembers
      if (table === "organizations") return builders.organizations
      throw new Error("Unknown table")
    })
  })

  it("fetches current user profile and organization", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1", roli: "OJQ" } }, error: null })
    builders.users.single.mockResolvedValue({ data: { id: "user-1", roli: "OJQ" }, error: null })
    builders.orgMembers.single.mockResolvedValue({ data: { organization_id: "org-1" }, error: null })
    builders.organizations.single.mockResolvedValue({ data: { id: "org-1" }, error: null })

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
    builders.users.single.mockResolvedValue({ data: { id: "user-2" }, error: null })

    const result = await fetchUserProfileById("user-2")
    expect(result.userProfile?.id).toBe("user-2")
  })

  it("ensures org membership", async () => {
    builders.orgMembers.single.mockResolvedValue({ data: { id: "membership" }, error: null })
    const resp = await ensureUserOrganizationMembership(supabase as any, "org-1", "user-1")
    expect(resp.isMember).toBe(true)

    builders.orgMembers.single.mockResolvedValue({ data: null, error: { code: "PGRST116" } })
    const noMember = await ensureUserOrganizationMembership(supabase as any, "org-1", "user-1")
    expect(noMember.isMember).toBe(false)
  })
})
