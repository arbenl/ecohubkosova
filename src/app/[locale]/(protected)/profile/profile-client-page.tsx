"use client"

import { type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfileForm } from "./components/user-profile-form"
import { OrganizationProfileForm } from "./components/org-profile-form"
import { ProfileSectionCard } from "./components/profile-section-card"
import { PasswordChangeForm } from "./components/password-change-form"

interface UserProfile {
  id: string
  full_name: string
  email: string
  location: string
  role: string
  is_approved: boolean
  created_at: string
}

interface Organization {
  id: string
  name: string
  description: string
  primary_interest: string
  contact_person: string
  contact_email: string
  location: string
  type: string
  is_approved: boolean
}

interface ProfileClientPageProps {
  userProfile: UserProfile | null
  organization: Organization | null
}

type TabConfig = {
  value: "personal" | "organization" | "password"
  label: string
  content: ReactNode
  show: boolean
}

export default function ProfileClientPage({ userProfile, organization }: ProfileClientPageProps) {
  const t = useTranslations("profile")

  if (!userProfile) {
    return null
  }

  const tabs: TabConfig[] = [
    {
      value: "personal",
      label: t("tabs.personal"),
      show: true,
      content: (
        <ProfileSectionCard
          title={t("personalProfile")}
          description={t("manageProfileDescription")}
        >
          <UserProfileForm
            initialFullName={userProfile.full_name}
            initialEmail={userProfile.email}
            initialLocation={userProfile.location}
          />
        </ProfileSectionCard>
      ),
    },
    {
      value: "organization",
      label: t("tabs.organization"),
      show: true,
      content: (
        <ProfileSectionCard title={t("orgProfile")} description={t("manageOrgDescription")}>
          {organization ? (
            <OrganizationProfileForm
              organizationId={organization.id}
              initialData={{
                name: organization.name,
                description: organization.description,
                primary_interest: organization.primary_interest,
                contact_person: organization.contact_person,
                contact_email: organization.contact_email,
                location: organization.location,
              }}
            />
          ) : (
            <p className="text-sm text-gray-500">{t("noOrgToUpdate")}</p>
          )}
        </ProfileSectionCard>
      ),
    },
    {
      value: "password",
      label: t("changePassword"),
      show: true,
      content: (
        <ProfileSectionCard
          title={t("changePassword")}
          description={t("changePasswordDescription")}
        >
          <PasswordChangeForm />
        </ProfileSectionCard>
      ),
    },
  ]

  const visibleTabs = tabs.filter((tab) => tab.show)

  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList>
        {visibleTabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {visibleTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
