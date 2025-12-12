import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useLatestArticlesSection, useKeyPartnersSection } from "./use-dashboard-sections"

vi.mock("next-intl", () => ({
  useLocale: () => "sq",
}))

describe("useLatestArticlesSection hook", () => {
  it("maps articles safely", () => {
    const articles = [
      { id: "1", title: "A", users: { full_name: "Author" } },
      { id: "2", title: "B", users: null },
    ]
    const { result } = renderHook(() => useLatestArticlesSection(articles as any))
    expect(result.current.items).toHaveLength(2)
    expect(result.current.hasItems).toBe(true)
    expect(result.current.items[0].href).toContain("/knowledge/articles/1")
  })
})

describe("useKeyPartnersSection hook", () => {
  it("maps partners safely", () => {
    const partners = [{ id: "p1", name: "Partner", type: "Org", location: "City" }]
    const { result } = renderHook(() => useKeyPartnersSection(partners as any))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].href).toContain("/partners/p1")
    expect(result.current.hasItems).toBe(true)
  })
})
