import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { KnowledgeSidebar } from "knowledge-sidebar"

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

// Mock external dependencies

describe("KnowledgeSidebar component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <KnowledgeSidebar />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <KnowledgeSidebar />
    )
    expect(container).toBeInTheDocument()
  })
})