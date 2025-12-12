import { describe, expect, it, vi } from "vitest"
import HomeRedirect from "./page"
import { redirect } from "@/i18n/routing"

vi.mock("@/i18n/routing", () => ({
  redirect: vi.fn(),
}))

describe("HomeRedirect", () => {
  it("redirects to marketplace", async () => {
    const params = Promise.resolve({ locale: "en" })
    await HomeRedirect({ params })
    expect(redirect).toHaveBeenCalledWith({ href: "/marketplace", locale: "en" })
  })
})
