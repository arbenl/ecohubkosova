import { describe, expect, it, vi } from "vitest"
import DashboardRedirectPage from "./page"
import { redirect } from "@/i18n/routing"

const mockGetServerUser = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => ({
    auth: { getUser: mockGetServerUser },
  }),
}))

const mockDbSelect = vi.fn()
vi.mock("@/lib/drizzle", () => ({
  db: {
    get: () => ({
      select: () => ({
        from: () => ({ where: () => ({ limit: mockDbSelect }) }),
      }),
    }),
  },
}))

vi.mock("@/db/schema", () => ({ users: { role: "role", id: "id" } }))

vi.mock("drizzle-orm", () => ({ eq: vi.fn() }))

vi.mock("@/i18n/routing", () => ({
  redirect: vi.fn(),
}))

describe("DashboardRedirectPage", () => {
  it("redirects to login if no user", async () => {
    mockGetServerUser.mockResolvedValue({ data: { user: null } })
    await DashboardRedirectPage({ params: Promise.resolve({ locale: "en" }) })
    expect(redirect).toHaveBeenCalledWith({ href: "/login", locale: "en" })
  })

  it("redirects to admin if role is Admin", async () => {
    mockGetServerUser.mockResolvedValue({ data: { user: { id: "1" } } })
    mockDbSelect.mockResolvedValue([{ role: "Admin" }])
    await DashboardRedirectPage({ params: Promise.resolve({ locale: "en" }) })
    expect(redirect).toHaveBeenCalledWith({ href: "/admin", locale: "en" })
  })

  it("redirects to user dashboard if role is User", async () => {
    mockGetServerUser.mockResolvedValue({ data: { user: { id: "1" } } })
    mockDbSelect.mockResolvedValue([{ role: "User" }])
    await DashboardRedirectPage({ params: Promise.resolve({ locale: "en" }) })
    expect(redirect).toHaveBeenCalledWith({ href: "/my", locale: "en" })
  })

  it("redirects to user dashboard if role is missing/guest", async () => {
    mockGetServerUser.mockResolvedValue({ data: { user: { id: "1" } } })
    mockDbSelect.mockResolvedValue([])
    await DashboardRedirectPage({ params: Promise.resolve({ locale: "en" }) })
    expect(redirect).toHaveBeenCalledWith({ href: "/my", locale: "en" })
  })
})
