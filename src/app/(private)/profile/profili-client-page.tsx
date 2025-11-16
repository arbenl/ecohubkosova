"use client"

import { type ReactNode } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfileForm } from "./components/user-profile-form"
import { OrganizationProfileForm } from "./components/org-profile-form"
import { ProfileSectionCard } from "./components/profile-section-card"

interface UserProfile {
  id: string
  emri_i_plote: string
  email: string
  vendndodhja: string
  roli: string
  eshte_aprovuar: boolean
  created_at: string
}

interface Organization {
  id: string
  emri: string
  pershkrimi: string
  interesi_primar: string
  person_kontakti: string
  email_kontakti: string
  vendndodhja: string
  lloji: string
  eshte_aprovuar: boolean
}

interface ProfiliClientPageProps {
  userProfile: UserProfile | null
  organization: Organization | null
}

type TabConfig = {
  value: "personal" | "organization" | "password"
  label: string
  content: ReactNode
  show: boolean
}

export default function ProfiliClientPage({ userProfile, organization }: ProfiliClientPageProps) {
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
            initialFullName={userProfile.emri_i_plote}
            initialEmail={userProfile.email}
            initialLocation={userProfile.vendndodhja}
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
                emri: organization.emri,
                pershkrimi: organization.pershkrimi,
                interesi_primar: organization.interesi_primar,
                person_kontakti: organization.person_kontakti,
                email_kontakti: organization.email_kontakti,
                vendndodhja: organization.vendndodhja,
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
