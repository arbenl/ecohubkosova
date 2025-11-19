import { describe, expect, it, vi } from "vitest"
import { QuickActionsCard } from "quick-actions-card"

// Mock Next.js
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock icons
vi.mock("lucide-react", () => ({
  ShoppingCart: () => <div data-testid="shoppingcart-icon" />,
  Users: () => <div data-testid="users-icon" />,
  BookOpen: () => <div data-testid="bookopen-icon" />,
  User: () => <div data-testid="user-icon" />,
}))

describe("QuickActionsCard utility", () => {
  it("should be defined", () => {
    expect(QuickActionsCard).toBeDefined()
  })

  // Add specific utility tests based on functionality
})