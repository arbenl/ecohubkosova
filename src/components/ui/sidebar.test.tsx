import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Sidebar, SidebarProvider } from "./sidebar"

// Mock hooks
vi.mock("@/hooks/use-mobile", () => ({
  useMobile: vi.fn(),
  useIsMobile: vi.fn(() => false),
}))

// Mock icons
vi.mock("lucide-react", () => ({
  PanelLeft: () => <div data-testid="panelleft-icon" />,
}))

// Mock external dependencies

describe("Sidebar component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    )
    expect(container).toBeInTheDocument()
  })
})