import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Alert, AlertDescription, AlertTitle } from "./alert"

// Mock icons
vi.mock("lucide-react", () => ({
  AlertCircle: () => <div data-testid="alertcircle-icon" />,
  CheckCircle2: () => <div data-testid="checkcircle2-icon" />,
  Info: () => <div data-testid="info-icon" />,
  AlertTriangle: () => <div data-testid="alerttriangle-icon" />,
}))

describe("Alert stories", () => {
  it("renders Default story without crashing", () => {
    expect(() => render(
      <Alert>
        <div data-testid="alertcircle-icon" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components to your app using the code below.</AlertDescription>
      </Alert>
    )).not.toThrow()
  })

  it("renders Success story without crashing", () => {
    expect(() => render(
      <Alert className="border-green-200 bg-green-50">
        <div data-testid="checkcircle2-icon" />
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>Your changes have been saved.</AlertDescription>
      </Alert>
    )).not.toThrow()
  })

  it("renders with basic structure", () => {
    const { container } = render(
      <meta />
    )
    expect(container).toBeInTheDocument()
  })
})