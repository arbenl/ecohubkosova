"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSupabase } from "@/lib/auth-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-provider"
import { useEffect } from "react"

export default function ShtoListimPage() {
  const router = useRouter()
  const supabase = useSupabase()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    titulli: "",
    pershkrimi: "",
    kategori: "",
    çmimi: "",
    njesia: "copë",
    vendndodhja: "",
    sasia: "",
    lloji_listimit: "shes" as "shes" | "blej",
  })

  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/kycu?message=Please log in to post a listing.")
    }
  }, [user, isLoading, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6 max-w-3xl">
            <div className="text-center">
              <p>Duke ngarkuar...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Don't render form if user is not authenticated
  if (!user) {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user) {
        throw new Error("Ju duhet të jeni të kyçur për të shtuar një listim.")
      }

      // Check if user is part of an organization
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("eshte_aprovuar", true)
        .single()

      // Create listing
      const { error: insertError } = await supabase.from("tregu_listime").insert({
        created_by_user_id: user.id,
        organization_id: orgMember?.organization_id || null,
        titulli: formData.titulli,
        pershkrimi: formData.pershkrimi,
        kategori: formData.kategori,
        çmimi: Number.parseFloat(formData.çmimi),
        njesia: formData.njesia,
        vendndodhja: formData.vendndodhja,
        sasia: formData.sasia,
        lloji_listimit: formData.lloji_listimit,
        eshte_aprovuar: false, // Requires approval
      })

      if (insertError) throw insertError

      setSuccess(true)

      // Reset form
      setFormData({
        titulli: "",
        pershkrimi: "",
        kategori: "",
        çmimi: "",
        njesia: "copë",
        vendndodhja: "",
        sasia: "",
        lloji_listimit: "shes",
      })

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/tregu")
      }, 3000)
    } catch (error: any) {
      setError(error.message || "Gabim gjatë shtimit të listimit. Ju lutemi provoni përsëri.")
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    "Materiale të riciklueshme",
    "Produkte të qëndrueshme",
    "Shërbime",
    "Energji e ripërtëritshme",
    "Ushqim dhe bujqësi",
    "Tekstile",
    "Elektronikë",
    "Tjera",
  ]

  const units = [
    "copë",
    "kg",
    "ton",
    "litër",
    "metër",
    "metër katror",
    "metër kub",
    "orë",
    "ditë",
    "muaj",
    "vit",
    "paketë",
    "tjetër",
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Shto listim të ri në treg</h1>
            <p className="text-gray-600 mt-1">
              Plotësoni formularin më poshtë për të shtuar një listim të ri në tregun e ekonomisë qarkulluese
            </p>
          </div>

          {success ? (
            <Card>
              <CardHeader>
                <CardTitle>Listimi u shtua me sukses!</CardTitle>
                <CardDescription>
                  Listimi juaj është dërguar për aprovim. Do të njoftoheni sapo të aprovohet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Po ridrejtoheni në faqen e tregut...</p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/tregu">Kthehu në treg</Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Detajet e listimit</CardTitle>
                <CardDescription>Jepni informacione sa më të detajuara për listimin tuaj</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Gabim</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="lloji_listimit">Lloji i listimit</Label>
                      <RadioGroup
                        value={formData.lloji_listimit}
                        onValueChange={(value) => handleSelectChange("lloji_listimit", value)}
                        className="flex flex-col space-y-1 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="shes" id="shes" />
                          <Label htmlFor="shes">Për Shitje - Kam diçka për të shitur/ofruar</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="blej" id="blej" />
                          <Label htmlFor="blej">Kërkoj të Blej - Jam në kërkim të diçkaje</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="titulli">Titulli *</Label>
                      <Input
                        id="titulli"
                        name="titulli"
                        value={formData.titulli}
                        onChange={handleChange}
                        placeholder="p.sh. Materiale plastike të riciklueshme"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="pershkrimi">Përshkrimi *</Label>
                      <Textarea
                        id="pershkrimi"
                        name="pershkrimi"
                        value={formData.pershkrimi}
                        onChange={handleChange}
                        placeholder="Jepni një përshkrim të detajuar të produktit/shërbimit"
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="kategori">Kategoria *</Label>
                      <Select
                        value={formData.kategori}
                        onValueChange={(value) => handleSelectChange("kategori", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Zgjidhni kategorinë" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="çmimi">Çmimi (€) *</Label>
                        <Input
                          id="çmimi"
                          name="çmimi"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.çmimi}
                          onChange={handleChange}
                          placeholder="p.sh. 10.50"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="njesia">Njësia *</Label>
                        <Select
                          value={formData.njesia}
                          onValueChange={(value) => handleSelectChange("njesia", value)}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Zgjidhni njësinë" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sasia">Sasia e disponueshme *</Label>
                      <Input
                        id="sasia"
                        name="sasia"
                        value={formData.sasia}
                        onChange={handleChange}
                        placeholder="p.sh. 100 kg, 5-10 copë, etj."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="vendndodhja">Vendndodhja *</Label>
                      <Input
                        id="vendndodhja"
                        name="vendndodhja"
                        value={formData.vendndodhja}
                        onChange={handleChange}
                        placeholder="p.sh. Prishtinë, Kosovë"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" type="button" asChild>
                      <Link href="/tregu">Anulo</Link>
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      disabled={loading}
                    >
                      {loading ? "Duke dërguar..." : "Dërgo për aprovim"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
