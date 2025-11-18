"use client"

import { type ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfileForm } from "./components/user-profile-form"
import { OrganizationProfileForm } from "./components/org-profile-form"
import { ProfileSectionCard } from "./components/profile-section-card"

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
  if (!userProfile) {
    return null
  }

  const tabs: TabConfig[] = [
    {
      value: "personal",
      label: "Informacione personale",
      show: true,
      content: (
        <ProfileSectionCard
          title="Profili Personal"
          description="Ndrysho informacionet personale."
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
      label: "Profili i organizatës",
      show: true,
      content: (
        <ProfileSectionCard
          title="Profili i organizatës"
          description="Ndrysho të dhënat e organizatës."
        >
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
            <p className="text-sm text-gray-500">Nuk ka organizatë për të përditësuar.</p>
          )}
        </ProfileSectionCard>
      ),
    },
    {
      value: "password",
      label: "Ndrysho fjalëkalimin",
      show: true,
      content: (
        <ProfileSectionCard title="Ndrysho fjalëkalimin" description="Zëvendëso fjalëkalimin ekzistues me një të ri.">
          <p>Forma për ndryshim fjalëkalimi do të shtohet këtu.</p>
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
