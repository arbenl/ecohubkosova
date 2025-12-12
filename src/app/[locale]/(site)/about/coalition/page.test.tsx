import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import KoalicioniPage from "./page"

// Mock icons
vi.mock("lucide-react", () => ({
  Users: () => <div data-testid="users-icon" />,
  Building: () => <div data-testid="building-icon" />,
  Lightbulb: () => <div data-testid="lightbulb-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
}))

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe("KoalicioniPage", () => {
  it("renders the main heading", () => {
    render(<KoalicioniPage />)
    expect(screen.getByText("Koalicioni i")).toBeInTheDocument()
    expect(screen.getByText("Ekonomisë Qarkore")).toBeInTheDocument()
  })

  it("renders section cards", () => {
    render(<KoalicioniPage />)
    expect(screen.getByText("Rreth Koalicionit")).toBeInTheDocument()
    expect(screen.getByText("Anëtarësia")).toBeInTheDocument()
    expect(screen.getByText("Struktura")).toBeInTheDocument()
  })
})
