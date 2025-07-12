"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useSupabase, useAuth } from "@/lib/auth-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Package, Euro, User, Building } from "lucide-react"

interface Listing {
  id: string
  titulli: string
  pershkrimi: string
  kategori: string
  çmimi: number
  njesia: string
  vendndodhja: string
  sasia: string
  lloji_listimit: "shes" | "blej"
  created_at: string
  users?: {
    emri_i_plotë: string
    email: string
  }
  organizations?: {
    emri: string
    email_kontakti: string
  }
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)

  const supabase = useSupabase()

  useEffect(() => {
    const fetchListing = async () => {
      if (!params.id) return

      try {
        const { data, error } = await supabase
          .from("tregu_listime")
          .select(`
            *,
            users (emri_i_plotë, email),
            organizations (emri, email_kontakti)
          `)
          .eq("id", params.id)
          .eq("eshte_aprovuar", true)
          .single()

        if (error) {
          throw error
        }

        setListing(data)
      } catch (error: any) {
        console.error("Error fetching listing:", error)
        setError("Listimi nuk u gjet ose nuk është i aprovuar.")
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [params.id, supabase])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("sq-XK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p>Duke ngarkuar listimin...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Listimi nuk u gjet</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button asChild>
                <Link href="/tregu">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kthehu në Treg
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/tregu">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kthehu në Treg
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={listing.lloji_listimit === "shes" ? "default" : "secondary"}
                      className={
                        listing.lloji_listimit === "shes"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      }
                    >
                      {listing.lloji_listimit === "shes" ? "Për Shitje" : "Kërkoj të Blej"}
                    </Badge>
                    <span className="text-sm text-gray-500">{formatDate(listing.created_at)}</span>
                  </div>

                  <CardTitle className="text-3xl font-bold">{listing.titulli}</CardTitle>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{listing.kategori}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Përshkrimi</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{listing.pershkrimi}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Euro className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="font-medium">Çmimi:</span>
                        <p className="text-lg font-bold text-emerald-600">
                          {listing.çmimi} € / {listing.njesia}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="font-medium">Sasia:</span>
                        <p>{listing.sasia}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="font-medium">Vendndodhja:</span>
                        <p>{listing.vendndodhja}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="font-medium">Publikuar:</span>
                        <p>{formatDate(listing.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informacione Kontakti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {listing.organizations ? (
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{listing.organizations.emri}</p>
                        {user ? (
  <a
    href={`mailto:${listing.organizations.email_kontakti}`}
    className="text-sm text-emerald-600 hover:underline"
  >
    {listing.organizations.email_kontakti}
  </a>
) : (
  <p className="text-sm italic text-gray-400">Kyçu për ta parë emailin</p>
)}

                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">{listing.users?.emri_i_plotë || "Anonim"}</p>
                        {user ? (
  <a
    href={`mailto:${listing.users?.email}`}
    className="text-sm text-emerald-600 hover:underline"
  >
    {listing.users?.email}
  </a>
) : (
  <p className="text-sm italic text-gray-400">Kyçu për ta parë emailin</p>
)}

                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    onClick={() => {
                      if (user) {
                        setShowContactModal(true)
                      } else {
                        router.push("/auth/kycu?message=Ju duhet të kyçeni për të kontaktuar shitësin")
                      }
                    }}
                  >
                    Kontakto
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detaje të Shpejta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lloji:</span>
                    <span className="font-medium">
                      {listing.lloji_listimit === "shes" ? "Për Shitje" : "Kërkoj të Blej"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kategoria:</span>
                    <span className="font-medium">{listing.kategori}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Njësia:</span>
                    <span className="font-medium">{listing.njesia}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendndodhja:</span>
                    <span className="font-medium">{listing.vendndodhja}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Modal */}
          {showContactModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4">Informacione Kontakti</h3>
                {listing.organizations ? (
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Organizata:</span>
                      <p className="text-lg">{listing.organizations.emri}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      {user ? (
  <p className="text-lg text-emerald-600">{listing.organizations.email_kontakti}</p>
) : (
  <p className="italic text-gray-400">Kyçu për ta parë emailin</p>
)}

                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Emri:</span>
                      <p className="text-lg">{listing.users?.emri_i_plotë || "Anonim"}</p>
                    </div>
                   <div>
  <span className="font-medium text-gray-700">Email:</span>
  {user ? (
    <p className="text-lg text-emerald-600">{listing.users?.email}</p>
  ) : (
    <p className="italic text-gray-400">Kyçu për ta parë emailin</p>
  )}
</div>
                  </div>
                )}
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowContactModal(false)} className="flex-1">
                    Mbyll
                  </Button>
                  <Button
                    onClick={() => {
                      const email = listing.organizations?.email_kontakti || listing.users?.email
                      if (email) {
                        window.location.href = `mailto:${email}?subject=Interesim për: ${listing.titulli}`
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    Dërgo Email
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/tregu">Shiko më shumë listime</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
