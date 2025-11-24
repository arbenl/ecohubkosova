import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, beforeEach, vi } from "vitest"
import { ContactCardV2 } from "./ContactCardV2"
import type { Listing } from "@/types"

const t = (key: string) =>
  (
    {
      "contact.title": "Contact",
      "contact.anonymousLabel": "Anonymous organization",
      "contact.orgFallbackName": "Organization",
      "contact.creatorFallbackName": "Listing creator",
      "contact.reveal": "Reveal contact",
      "contact.sendEmail": "Send email",
      "contact.copy": "Copy",
      "contact.copied": "Copied",
      "contact.disclaimer": "Disclaimer",
      "contact.unavailable": "Unavailable",
      "contact.phoneLabel": "Phone",
      "contact.websiteLabel": "Website",
      "contact.contactPersonLabel": "Contact person",
    } satisfies Record<string, string>
  )[key] || key

vi.mock("next-intl", () => ({
  useTranslations: () => t,
}))

beforeEach(() => {
  // @ts-expect-error - partial clipboard mock is enough for tests
  global.navigator.clipboard = {
    writeText: vi.fn().mockResolvedValue(undefined),
  }
})

const baseListing: Listing = {
  id: "id-1",
  title: "Sample listing",
  description: "desc",
  foto_url: null,
  price: null,
  currency: "EUR",
  category: "cat",
  condition: "",
  location: "",
  contact: "",
  created_at: new Date().toISOString(),
  user_id: "user-1",
  is_published: true,
  listing_type: "shes",
  quantity: "",
  unit: "",
  organization_id: "org-1",
  visibility: "PUBLIC",
  status: "ACTIVE",
}

describe("ContactCardV2", () => {
  it("prefers organization contact details", () => {
    render(
      <ContactCardV2
        listing={{
          ...baseListing,
          organization_name: "REC-KOS",
          organization_contact_email: "info@rec-kos.com",
          organization_contact_phone: "123",
          organization_contact_website: "https://rec-kos.com",
        }}
      />
    )

    expect(screen.getByText("REC-KOS")).toBeInTheDocument()
    const reveal = screen.getByRole("button", { name: /reveal/i })
    expect(reveal).toBeEnabled()
    fireEvent.click(reveal)

    expect(screen.getByText("info@rec-kos.com")).toBeInTheDocument()
    const mailto = screen.getByRole("link", { name: /send email/i })
    expect(mailto).toHaveAttribute("href", expect.stringContaining("info@rec-kos.com"))
  })

  it("falls back to creator contact when org contact is missing", () => {
    render(
      <ContactCardV2
        listing={{
          ...baseListing,
          organization_name: null,
          organization_contact_email: null,
          creator_full_name: "Creator Name",
          creator_email: "creator@example.com",
        }}
      />
    )

    expect(screen.getByText("Creator Name")).toBeInTheDocument()
    const reveal = screen.getByRole("button", { name: /reveal/i })
    fireEvent.click(reveal)

    expect(screen.getByText("creator@example.com")).toBeInTheDocument()
    const mailto = screen.getByRole("link", { name: /send email/i })
    expect(mailto).toHaveAttribute("href", expect.stringContaining("creator@example.com"))
  })

  it("shows anonymous state when no contact exists", () => {
    render(
      <ContactCardV2
        listing={{
          ...baseListing,
          organization_name: null,
          organization_contact_email: null,
          creator_full_name: null,
          creator_email: null,
        }}
      />
    )

    expect(screen.getByText("Anonymous organization")).toBeInTheDocument()
    const reveal = screen.getByRole("button", { name: /reveal/i })
    expect(reveal).toBeDisabled()
    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
  })
})
