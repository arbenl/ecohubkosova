import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { async } from "page"

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
  ArrowLeft: () => <div data-testid="arrowleft-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  MapPin: () => <div data-testid="mappin-icon" />,
  Package: () => <div data-testid="package-icon" />,
  Euro: () => <div data-testid="euro-icon" />,
  User: () => <div data-testid="user-icon" />,
  Building: () => <div data-testid="building-icon" />,
}))

describe("async component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <async />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <async />
    )
    expect(container).toBeInTheDocument()
  })
})