import { renderHook, act } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useDashboardStatsCards } from "./use-dashboard-stats"

// Mock icons
vi.mock("lucide-react", () => ({
  BookOpen: () => <div data-testid="bookopen-icon" />,
  Building: () => <div data-testid="building-icon" />,
  ShoppingCart: () => <div data-testid="shoppingcart-icon" />,
  Users: () => <div data-testid="users-icon" />,
}))

describe("useDashboardStatsCards hook", () => {
  it("returns expected values", () => {
    const mockStats = {
      organizationsCount: 5,
      articlesCount: 10,
      usersCount: 25,
      listingsCount: 8,
    }

    const mockT = vi.fn((key: string) => {
      const translations: Record<string, string> = {
        "dashboard.organizations": "Organizations",
        "dashboard.organizationsDesc": "Approved",
        "dashboard.articles": "Articles",
        "dashboard.articlesDesc": "Published",
        "dashboard.members": "Members",
        "dashboard.membersDesc": "Registered",
        "dashboard.listings": "Listings",
        "dashboard.listingsDesc": "In market",
      }
      return translations[key] || key
    })

    const { result } = renderHook(() => useDashboardStatsCards(mockStats, mockT))

    // Add specific assertions based on hook analysis
    expect(result.current).toBeDefined()
    expect(Array.isArray(result.current)).toBe(true)
    expect(result.current).toHaveLength(4)
    expect(result.current[0]).toMatchObject({
      title: "Organizations",
      description: "Approved",
      value: 5,
    })
  })
})