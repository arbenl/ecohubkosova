import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

// Mock all dependencies before importing the component
vi.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>
      {children}
    </button>
  ),
}))

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}))

vi.mock("next-intl", () => ({
  useLocale: () => "sq",
}))

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock("lucide-react", () => ({
  LayoutDashboard: () => <div data-testid="dashboard-icon">Dashboard</div>,
  BookOpen: () => <div data-testid="book-icon">Book</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  ShoppingCart: () => <div data-testid="cart-icon">Cart</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="close-icon">X</div>,
}))

vi.mock("../../sign-out-button", () => ({
  SignOutButton: ({ children, ...props }: any) => (
    <button {...props} data-testid="sign-out-button">
      {children}
    </button>
  ),
}))

vi.mock("react", async () => {
  const actualReact = await vi.importActual("react")
  return {
    ...actualReact,
    useState: vi.fn((initial) => [initial, vi.fn()]),
    useEffect: vi.fn(),
  }
})

// Now import the component
import { Sidebar } from "../sidebar"

describe("Sidebar component", () => {
  it("renders without crashing", () => {
    expect(() => render(<Sidebar userRole="User" />)).not.toThrow()
  })

  it("renders navigation links", () => {
    render(<Sidebar userRole="User" />)
    expect(screen.getAllByText("Paneli")).toHaveLength(2) // One for mobile, one for desktop
    expect(screen.getAllByText("Qendra e Dijes")).toHaveLength(2)
    expect(screen.getAllByText("Tregu")).toHaveLength(2)
  })

  it("renders admin route for admin user", () => {
    render(<Sidebar userRole="Admin" />)
    expect(screen.getAllByText("Administrimi")).toHaveLength(2) // One for mobile, one for desktop
  })

  it("does not render admin route for regular user", () => {
    render(<Sidebar userRole="User" />)
    expect(screen.queryByText("Administrimi")).not.toBeInTheDocument()
  })
})