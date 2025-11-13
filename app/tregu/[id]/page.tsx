import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Package, Euro, User, Building } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import ContactListingButton from "./contact-listing-button" // Will create this client component later
import { fetchListingById } from "@/src/services/listings"

interface Listing {
  id: string
  titulli: string
  pershkrimi: string
  kategori: string
  cmimi: number
  njesia: string
  vendndodhja: string
  sasia: string
  lloji_listimit: "shes" | "blej"
  created_at: string
  users?: {
    emri_i_plote: string
    email: string
  }
  organizations?: {
    emri: string
    email_kontakti: string
  }
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: listing, error } = await fetchListingById(params.id)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("sq-XK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
                          {listing.cmimi} € / {listing.njesia}
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
                        <p className="font-medium">{listing.users?.emri_i_plote || "Anonim"}</p>
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

                  <ContactListingButton listing={listing} user={user} />
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
