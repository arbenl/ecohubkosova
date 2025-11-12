"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { AlertCircle, CheckCircle } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { updateUserProfile, updateOrganizationProfile } from "./actions" // Import Server Actions
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  emri_i_plotë: string
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

export default function ProfiliClientPage({ userProfile, organization }: ProfiliClientPageProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [userFormData, setUserFormData] = useState({
    emri_i_plotë: userProfile?.emri_i_plotë || "",
    email: userProfile?.email || "",
    vendndodhja: userProfile?.vendndodhja || "",
  })

  const [orgFormData, setOrgFormData] = useState({
    emri: organization?.emri || "",
    pershkrimi: organization?.pershkrimi || "",
    interesi_primar: organization?.interesi_primar || "",
    person_kontakti: organization?.person_kontakti || "",
    email_kontakti: organization?.email_kontakti || "",
    vendndodhja: organization?.vendndodhja || "",
  })

  // Update form data if userProfile or organization props change (e.g., after revalidation)
  useEffect(() => {
    setUserFormData({
      emri_i_plotë: userProfile?.emri_i_plotë || "",
      email: userProfile?.email || "",
      vendndodhja: userProfile?.vendndodhja || "",
    });
    setOrgFormData({
      emri: organization?.emri || "",
      pershkrimi: organization?.pershkrimi || "",
      interesi_primar: organization?.interesi_primar || "",
      person_kontakti: organization?.person_kontakti || "",
      email_kontakti: organization?.email_kontakti || "",
      vendndodhja: organization?.vendndodhja || "",
    });
  }, [userProfile, organization]);


  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleOrgChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setOrgFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const result = await updateUserProfile({
      emri_i_plotë: userFormData.emri_i_plotë,
      vendndodhja: userFormData.vendndodhja,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Profili u përditësua me sukses!")
    }
    setSaving(false)
  }

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    if (!organization) {
      setError("Nuk ka organizatë për të përditësuar.")
      setSaving(false)
      return
    }

    const result = await updateOrganizationProfile(organization.id, {
      emri: orgFormData.emri,
      pershkrimi: orgFormData.pershkrimi,
      interesi_primar: orgFormData.interesi_primar,
      person_kontakti: orgFormData.person_kontakti,
      email_kontakti: orgFormData.email_kontakti,
      vendndodhja: orgFormData.vendndodhja,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Profili i organizatës u përditësua me sukses!")
    }
    setSaving(false)
  }

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
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Gabim</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Sukses</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <Label htmlFor="emri_i_plotë">Emri i Plotë</Label>
              <Input name="emri_i_plotë" value={userFormData.emri_i_plotë} onChange={handleUserChange} />
              <Label htmlFor="email">Email</Label>
              <Input name="email" value={userFormData.email} disabled />
              <Label htmlFor="vendndodhja">Vendndodhja</Label>
              <Input name="vendndodhja" value={userFormData.vendndodhja} onChange={handleUserChange} />
              <Button type="submit" disabled={saving}>{saving ? "Duke ruajtur..." : "Ruaj"}</Button>
            </form>
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
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Gabim</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Sukses</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleOrgSubmit} className="space-y-4">
              <Label htmlFor="emri">Emri</Label>
              <Input name="emri" value={orgFormData.emri} onChange={handleOrgChange} />
              <Label htmlFor="pershkrimi">Përshkrimi</Label>
              <Textarea name="pershkrimi" value={orgFormData.pershkrimi} onChange={handleOrgChange} />
              <Label htmlFor="interesi_primar">Interesi Primar</Label>
              <Input name="interesi_primar" value={orgFormData.interesi_primar} onChange={handleOrgChange} />
              <Label htmlFor="person_kontakti">Person Kontakti</Label>
              <Input name="person_kontakti" value={orgFormData.person_kontakti} onChange={handleOrgChange} />
              <Label htmlFor="email_kontakti">Email Kontakti</Label>
              <Input name="email_kontakti" value={orgFormData.email_kontakti} onChange={handleOrgChange} />
              <Label htmlFor="vendndodhja">Vendndodhja</Label>
              <Input name="vendndodhja" value={orgFormData.vendndodhja} onChange={handleOrgChange} />
              <Button type="submit" disabled={saving}>{saving ? "Duke ruajtur..." : "Ruaj"}</Button>
            </form>
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