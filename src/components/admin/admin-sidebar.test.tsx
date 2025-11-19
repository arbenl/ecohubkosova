import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AdminSidebar } from "admin-sidebar"

// Mock Next.js
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams()
}))

// Mock icons
vi.mock("lucide-react", () => ({
  Users: () => <div data-testid="users-icon" />,
  Building: () => <div data-testid="building-icon" />,
  BookOpen: () => <div data-testid="bookopen-icon" />,
  ShoppingCart: () => <div data-testid="shoppingcart-icon" />,
  LayoutDashboard: () => <div data-testid="layoutdashboard-icon" />,
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
}))

// Mock external dependencies

describe("AdminSidebar component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <AdminSidebar />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <AdminSidebar />
    )
    expect(container).toBeInTheDocument()
  })
})