"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { supabase } from "@/lib/supabase"

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

  const fetchProfileData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/auth/kycu")
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
      console.error("Error fetching profile:", err)
      setError(err.message || "Gabim gjatë ngarkimit të profilit.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

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
      await fetchProfileData()
    } catch (err: any) {
      setError(err.message || "Gabim gjatë përditësimit të profilit.")
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
      await fetchProfileData()
    } catch (err: any) {
      setError(
        err.message || "Gabim gjatë përditësimit të profilit të organizatës."
      )
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
              <TabsContent value="personal">/* You can re-use your UI layout here */</TabsContent>
              <TabsContent value="organization">/* Same for org */</TabsContent>
              <TabsContent value="password">/* Your password form */</TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
