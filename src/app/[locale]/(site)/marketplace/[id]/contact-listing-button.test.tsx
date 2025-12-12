import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi, beforeEach } from "vitest"
import ContactListingButton from "./contact-listing-button"

const pushMock = vi.fn()

vi.mock("@/i18n/routing", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock("next-intl", () => ({
  useLocale: () => "sq",
}))

const baseListing = {
  id: "listing-1",
  title: "Test Listing",
  users: {
    full_name: "Owner Name",
    email: "owner@test.com",
  },
  organizations: {
    name: "Test Org",
    contact_email: "org@test.com",
  },
}

describe("ContactListingButton", () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  it("redirects unauthenticated users to login", async () => {
    const user = userEvent.setup()
    render(<ContactListingButton listing={baseListing} user={null} />)

    await user.click(screen.getByRole("button", { name: /Kontakto/i }))
    expect(pushMock).toHaveBeenCalled()
    expect(pushMock.mock.calls[0][0]).toContain("/login")
  })

  it("shows contact modal for authenticated users", async () => {
    const user = userEvent.setup()
    render(<ContactListingButton listing={baseListing} user={{ id: "123" } as any} />)

    await user.click(screen.getByRole("button", { name: /Kontakto/i }))

    expect(screen.getByText(/Informacione Kontakti/)).toBeInTheDocument()
    expect(screen.getByText(baseListing.organizations.name)).toBeInTheDocument()
    expect(screen.getByText(baseListing.organizations.contact_email)).toBeInTheDocument()
  })
})
