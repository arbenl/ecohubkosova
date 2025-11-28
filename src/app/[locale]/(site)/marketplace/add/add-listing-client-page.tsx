"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-provider"
import { createListing } from "./actions" // Import the server action
import type { Locale } from "@/lib/locales"

interface City {
  value: string
  label: string
  region?: string
}

interface AddListingClientPageProps {
  cities: City[]
}

export default function AddListingClientPage({ cities }: AddListingClientPageProps) {
  const router = useRouter()
  const locale = useLocale() as Locale

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Materiale",
    price: "",
    unit: "copë",
    location: "",
    quantity: "",
    listing_type: "shes",
    foto_url: "",
  })

  const { user } = useAuth()

  // Don't render form if user is not authenticated (middleware should handle this, but as a fallback)
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

    const { foto_url, ...listingPayload } = formData
    const result = await createListing({
      ...listingPayload,
      listing_type: listingPayload.listing_type as "shes" | "blej",
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        price: "",
        unit: "copë",
        location: "",
        quantity: "",
        listing_type: "shes",
        foto_url: "",
      })

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(`/${locale}/marketplace`)
      }, 3000)
    }
    setLoading(false)
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
    <section className="flex-1 py-12">
      <div className="container px-4 md:px-6 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Shto listim të ri në treg</h1>
          <p className="text-gray-600 mt-1">
            Plotësoni formularin më poshtë për të shtuar një listim të ri në tregun e ekonomisë
            qarkulluese
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
                <Link href="/marketplace">Kthehu në treg</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Detajet e listimit</CardTitle>
              <CardDescription>
                Jepni informacione sa më të detajuara për listimin tuaj
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="listing_type">Lloji i listimit</Label>
                    <RadioGroup
                      value={formData.listing_type}
                      onValueChange={(value) => handleSelectChange("listing_type", value)}
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
                    <Label htmlFor="title">Titulli *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="p.sh. Materiale plastike të riciklueshme"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Përshkrimi *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Jepni një përshkrim të detajuar të produktit/shërbimit"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Kategoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
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
                      <Label htmlFor="price">Çmimi (€) *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit">Njësia *</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => handleSelectChange("unit", value)}
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
                    <Label htmlFor="quantity">Sasia e disponueshme *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="p.sh. 100 kg, 5-10 copë, etj."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Vendndodhja *</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => handleSelectChange("location", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidhni qytetin" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.label}
                            {city.region && ` (${city.region})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/marketplace">Anulo</Link>
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
    </section>
  )
}
