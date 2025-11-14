"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfileForm } from "./components/user-profile-form"
import { OrganizationProfileForm } from "./components/org-profile-form"

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

type UserFieldErrors = {
  emri_i_plote?: string
  vendndodhja?: string
}

type OrgFieldErrors = {
  emri?: string
  pershkrimi?: string
  interesi_primar?: string
  person_kontakti?: string
  email_kontakti?: string
  vendndodhja?: string
}

interface ProfiliClientPageProps {
  userProfile: UserProfile | null
  organization: Organization | null
}

export default function ProfiliClientPage({ userProfile, organization }: ProfiliClientPageProps) {
  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList>
        <TabsTrigger value="personal">Informacione personale</TabsTrigger>
        {organization && <TabsTrigger value="organization">Profili i organizatës</TabsTrigger>}
        <TabsTrigger value="password">Ndrysho fjalëkalimin</TabsTrigger>
      </TabsList>
      <TabsContent value="personal">
        <Card>
          <CardHeader>
            <CardTitle>Profili Personal</CardTitle>
            <CardDescription>Ndrysho informacionet personale.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserProfileForm
              initialFullName={userProfile?.emri_i_plote || ""}
              initialEmail={userProfile?.email || ""}
              initialLocation={userProfile?.vendndodhja || ""}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="organization">
        <Card>
          <CardHeader>
            <CardTitle>Profili i organizatës</CardTitle>
            <CardDescription>Ndrysho të dhënat e organizatës.</CardDescription>
          </CardHeader>
          <CardContent>
            {organization ? (
              <OrganizationProfileForm
                organizationId={organization.id}
                initialData={{
                  emri: organization.emri || "",
                  pershkrimi: organization.pershkrimi || "",
                  interesi_primar: organization.interesi_primar || "",
                  person_kontakti: organization.person_kontakti || "",
                  email_kontakti: organization.email_kontakti || "",
                  vendndodhja: organization.vendndodhja || "",
                }}
              />
            ) : (
              <p className="text-sm text-gray-500">Nuk ka organizatë për të përditësuar.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Ndrysho fjalëkalimin</CardTitle>
            <CardDescription>Zëvendëso fjalëkalimin ekzistues me një të ri.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Forma për ndryshim fjalëkalimi do të shtohet këtu.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
