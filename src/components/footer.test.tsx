import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Footer } from "./footer"

// Mock Next.js
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock next-intl
vi.mock("next-intl", () => ({
  useLocale: () => "en"
}))

// Mock external dependencies

describe("Footer component", () => {
  it("renders without crashing", () => {
    expect(() => render(
      <Footer />
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <Footer />
    )
    expect(container).toBeInTheDocument()
  })
})