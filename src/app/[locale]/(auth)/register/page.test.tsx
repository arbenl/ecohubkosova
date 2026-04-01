import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import RegjistrohuPage from "./page"

// Mock translations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}))

// Mock routing
vi.mock("@/i18n/routing", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  Link: ({ children }: any) => <a>{children}</a>,
}))

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => null }),
}))

// Mock server actions
vi.mock("./actions", () => ({
  registerUser: vi.fn(),
}))

// Mock UI components to prevent rendering issues
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <div>{children}</div>,
}))

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} role="textbox" />,
}))

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}))

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: (props: any) => <input type="checkbox" {...props} />,
}))

vi.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children }: any) => <div>{children}</div>,
  RadioGroupItem: (props: any) => <input type="radio" {...props} />,
}))

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: any) => <textarea {...props} />,
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

describe("RegjistrohuPage", () => {
  it("renders the first step of registration form", () => {
    render(<RegjistrohuPage />)
    // Check for Step 1 fields
    expect(screen.getByText("fullName")).toBeInTheDocument()
    expect(screen.getByText("email")).toBeInTheDocument()
    expect(screen.getByText("password")).toBeInTheDocument()
    expect(screen.getByText("confirmPassword")).toBeInTheDocument()
    // Button
    expect(screen.getByText("continue")).toBeInTheDocument()
  })

  it("advances to the next step when required fields are filled without re-selecting the default role", () => {
    render(<RegjistrohuPage />)

    act(() => {
      fireEvent.change(screen.getByLabelText("fullName"), {
        target: { name: "full_name", value: "Test User" },
      })
      fireEvent.change(screen.getByLabelText("email"), {
        target: { name: "email", value: "test@example.com" },
      })
      fireEvent.change(screen.getByLabelText("password"), {
        target: { name: "password", value: "TestPass123!" },
      })
      fireEvent.change(screen.getByLabelText("confirmPassword"), {
        target: { name: "confirmPassword", value: "TestPass123!" },
      })
      fireEvent.change(screen.getByLabelText("location"), {
        target: { name: "location", value: "Prishtine" },
      })
    })

    fireEvent.click(screen.getByText("continue"))

    expect(screen.getByText("readyForNext")).toBeInTheDocument()
  })
})
