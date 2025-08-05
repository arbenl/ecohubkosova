"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
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

export default function ProfiliPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)

  const [userFormData, setUserFormData] = useState({
    emri_i_plotë: "",
    email: "",
    vendndodhja: "",
  })

  const [orgFormData, setOrgFormData] = useState({
    emri: "",
    pershkrimi: "",
    interesi_primar: "",
    person_kontakti: "",
    email_kontakti: "",
    vendndodhja: "",
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session || !session.user) {
          router.replace("/auth/kycu")
          return
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (userError) throw userError

        setUserProfile(userData)
        setUserFormData({
          emri_i_plotë: userData.emri_i_plotë || "",
          email: userData.email || "",
          vendndodhja: userData.vendndodhja || "",
        })

        if (userData.roli !== "Individ" && userData.roli !== "Admin") {
          const { data: orgMember } = await supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", session.user.id)
            .eq("eshte_aprovuar", true)
            .single()

          if (orgMember) {
            const { data: orgData, error: orgError } = await supabase
              .from("organizations")
              .select("*")
              .eq("id", orgMember.organization_id)
              .single()

            if (!orgError && orgData) {
              setOrganization(orgData)
              setOrgFormData({
                emri: orgData.emri || "",
                pershkrimi: orgData.pershkrimi || "",
                interesi_primar: orgData.interesi_primar || "",
                person_kontakti: orgData.person_kontakti || "",
                email_kontakti: orgData.email_kontakti || "",
                vendndodhja: orgData.vendndodhja || "",
              })
            }
          }
        }
      } catch (err: any) {
        console.error("Gabim në ngarkimin e profilit:", err)
        setError(err.message || "Gabim gjatë ngarkimit të profilit.")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOrgFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from("users")
        .update({
          emri_i_plotë: userFormData.emri_i_plotë,
          vendndodhja: userFormData.vendndodhja,
        })
        .eq("id", userProfile?.id)

      if (error) throw error

      setSuccess("Profili u përditësua me sukses!")
    } catch (error: any) {
      setError(error.message || "Gabim gjatë përditësimit të profilit.")
    } finally {
      setSaving(false)
    }
  }

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (!organization) return

      const { error } = await supabase
        .from("organizations")
        .update({
          emri: orgFormData.emri,
          pershkrimi: orgFormData.pershkrimi,
          interesi_primar: orgFormData.interesi_primar,
          person_kontakti: orgFormData.person_kontakti,
          email_kontakti: orgFormData.email_kontakti,
          vendndodhja: orgFormData.vendndodhja,
        })
        .eq("id", organization.id)

      if (error) throw error

      setSuccess("Profili i organizatës u përditësua me sukses!")
    } catch (error: any) {
      setError(error.message || "Gabim gjatë përditësimit të profilit të organizatës.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Profili im</h1>
            <p className="text-gray-600 mt-1">
              Menaxho informacionet e profilit tënd në ECO HUB KOSOVA
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p>Duke ngarkuar...</p>
            </div>
          ) : (
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList>
                <TabsTrigger value="personal">Informacione personale</TabsTrigger>
                {organization && <TabsTrigger value="organization">Profili i organizatës</TabsTrigger>}
                <TabsTrigger value="password">Ndrysho fjalëkalimin</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Informacionet personale</CardTitle>
                    <CardDescription>
                      Përditëso informacionet e profilit tënd personal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Gabim</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Sukses</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="emri_i_plotë">Emri i plotë</Label>
                        <Input
                          id="emri_i_plotë"
                          name="emri_i_plotë"
                          value={userFormData.emri_i_plotë}
                          onChange={handleUserChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          value={userFormData.email}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">
                          Emaili nuk mund të ndryshohet. Kontaktoni administratorin për ndihmë.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vendndodhja">Vendndodhja</Label>
                        <Input
                          id="vendndodhja"
                          name="vendndodhja"
                          value={userFormData.vendndodhja}
                          onChange={handleUserChange}
                          placeholder="p.sh. Prishtinë, Kosovë"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="roli">Roli</Label>
                        <Input
                          id="roli"
                          name="roli"
                          value={userProfile?.roli || ""}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                          disabled={saving}
                        >
                          {saving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {organization && (
                <TabsContent value="organization">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profili i organizatës</CardTitle>
                      <CardDescription>Përditëso informacionet e organizatës tuaj</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!organization.eshte_aprovuar && (
                        <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Në pritje të aprovimit</AlertTitle>
                          <AlertDescription>
                            Profili i organizatës tuaj është në pritje të aprovimit nga administratorët. Ju do të
                            njoftoheni sapo të aprovohet.
                          </AlertDescription>
                        </Alert>
                      )}

                      <form onSubmit={handleOrgSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="emri">Emri i organizatës</Label>
                          <Input id="emri" name="emri" value={orgFormData.emri} onChange={handleOrgChange} required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pershkrimi">Përshkrimi i organizatës</Label>
                          <Textarea
                            id="pershkrimi"
                            name="pershkrimi"
                            value={orgFormData.pershkrimi}
                            onChange={handleOrgChange}
                            rows={4}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="interesi_primar">Interesi primar</Label>
                          <Input
                            id="interesi_primar"
                            name="interesi_primar"
                            value={orgFormData.interesi_primar}
                            onChange={handleOrgChange}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="person_kontakti">Person kontakti</Label>
                            <Input
                              id="person_kontakti"
                              name="person_kontakti"
                              value={orgFormData.person_kontakti}
                              onChange={handleOrgChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email_kontakti">Email kontakti</Label>
                            <Input
                              id="email_kontakti"
                              name="email_kontakti"
                              type="email"
                              value={orgFormData.email_kontakti}
                              onChange={handleOrgChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vendndodhja">Vendndodhja</Label>
                          <Input
                            id="vendndodhja"
                            name="vendndodhja"
                            value={orgFormData.vendndodhja}
                            onChange={handleOrgChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lloji">Lloji</Label>
                          <Input id="lloji" name="lloji" value={organization.lloji} disabled className="bg-gray-50" />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                            disabled={saving || !organization.eshte_aprovuar}
                          >
                            {saving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Ndrysho fjalëkalimin</CardTitle>
                    <CardDescription>
                      Përditëso fjalëkalimin e llogarisë tënde
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current_password">Fjalëkalimi aktual</Label>
                        <Input id="current_password" type="password" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new_password">Fjalëkalimi i ri</Label>
                        <Input id="new_password" type="password" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">Konfirmo fjalëkalimin</Label>
                        <Input id="confirm_password" type="password" required />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        >
                          Ndrysho fjalëkalimin
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
