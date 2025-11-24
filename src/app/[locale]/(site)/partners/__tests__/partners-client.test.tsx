import { render, screen } from "@testing-library/react"
import { vi } from "vitest"

import { PartnersClient } from "../PartnersClient"
import type { Partner } from "@/services/partners"

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "sq",
}))

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={typeof href === "string" ? href : href?.pathname || ""} {...props}>
      {children}
    </a>
  ),
}))

describe("PartnersClient", () => {
  it("links partner cards to the partners detail route with locale", () => {
    const partner: Partner = {
      eco_org_id: "123",
      organization_id: "org-1",
      name: "Test Partner",
      description: null,
      location: "Prishtina",
      org_role: "RECYCLER",
      contact_email: "partner@test.com",
      verification_status: "VERIFIED",
      waste_types_handled: [],
      service_areas: [],
    }

    render(<PartnersClient locale="sq" partners={[partner]} roleLabels={{}} />)

    const viewLink = screen.getByRole("link", { name: "card.viewProfile" })
    expect(viewLink).toHaveAttribute("href", "/sq/partners/123")
  })
})
