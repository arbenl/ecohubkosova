import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Sidebar } from "sidebar"

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
  LayoutDashboard: () => <div data-testid="layoutdashboard-icon" />,
  BookOpen: () => <div data-testid="bookopen-icon" />,
  Users: () => <div data-testid="users-icon" />,
  ShoppingCart: () => <div data-testid="shoppingcart-icon" />,
  User: () => <div data-testid="user-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Menu: () => <div data-testid="menu-icon" />,
  X: () => <div data-testid="x-icon" />,
}))

// Mock external dependencies

describe("Sidebar component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Sidebar />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Sidebar />
    )
    expect(container).toBeInTheDocument()
  })
})