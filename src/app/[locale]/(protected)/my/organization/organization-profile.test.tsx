import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import OrganizationProfile from "./organization-profile"
import type { UserOrganization } from "@/services/organization-onboarding"

const messages: Record<string, string> = {
  "workspace.profile.memberRole": "Your role",
  "workspace.profile.memberRoleAdmin": "Administrator",
  "workspace.profile.memberRoleEditor": "Editor",
  "workspace.profile.memberRoleViewer": "Viewer",
  "workspace.profile.statusApproved": "Approved",
  "workspace.profile.statusPending": "Pending",
  "workspace.profile.location": "Location",
  "workspace.profile.primaryInterest": "Primary interest",
  "workspace.profile.contactPerson": "Contact person",
  "workspace.profile.contactEmail": "Contact email",
  "workspace.actions.viewPublicProfile": "View public profile",
  "workspace.actions.editProfile": "Edit profile",
}

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => messages[key] ?? key,
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const baseOrg: UserOrganization = {
  id: "org-1",
  name: "REC-KOS",
  description: "Org description",
  location: "Prishtinë",
  contact_person: "Arta",
  contact_email: "info@rec-kos.com",
  type: "Company",
  is_approved: true,
  primary_interest: "Recycling",
  role_in_organization: "admin",
}

describe("OrganizationProfile role labels", () => {
  it("shows admin role label", () => {
    render(<OrganizationProfile locale="sq" organization={baseOrg} />)
    expect(screen.getByText("Administrator")).toBeInTheDocument()
    expect(screen.getByText("Your role")).toBeInTheDocument()
  })

  it("shows editor role label", () => {
    render(<OrganizationProfile locale="sq" organization={{ ...baseOrg, role_in_organization: "editor" }} />)
    expect(screen.getByText("Editor")).toBeInTheDocument()
  })

  it("shows viewer role label", () => {
    render(<OrganizationProfile locale="sq" organization={{ ...baseOrg, role_in_organization: "viewer" }} />)
    expect(screen.getByText("Viewer")).toBeInTheDocument()
  })
})
