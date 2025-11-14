import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, MapPin, Mail, Phone, Users, ArrowLeft, ExternalLink } from "lucide-react"
import { getServerUser } from "@/lib/supabase/server"
import { fetchOrganizationById } from "@/services/organizations"

interface Organization {
  id: string
  emri: string
  pershkrimi: string
  interesi_primar: string
  person_kontakti: string
  email_kontakti: string
  vendndodhja: string
  lloji: string
  created_at: string
}

interface OrganizationDetailPageProps {
  params: {
    id: string
  }
}

export default async function OrganizationDetailPage({ params }: OrganizationDetailPageProps) {
  const { user } = await getServerUser()
  const isLoggedIn = !!user

  const { data: organization, error } = await fetchOrganizationById(params.id)

  if (error || !organization) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Organizata nuk u gjet</h2>
                <p className="text-gray-600 mb-6">
                  {error || "Organizata që kërkoni nuk ekziston ose nuk është aprovuar."}
                </p>
                <Button asChild>
                  <Link href="/drejtoria">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kthehu te drejtoria
                  </Link>
                </Button>
              </div>
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
        <div className="container px-4 md:px-6">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/drejtoria">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kthehu te drejtoria
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{organization.emri}</CardTitle>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge
                          variant="secondary"
                          className={
                            organization.lloji === "OJQ"
                              ? "bg-blue-100 text-blue-800"
                              : organization.lloji === "Ndërmarrje Sociale"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }
                        >
                          {organization.lloji}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {organization.pershkrimi}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Detajet e Organizatës
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Interesi Primar</h4>
                    <p className="text-gray-600">{organization.interesi_primar}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Vendndodhja</h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{organization.vendndodhja}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Data e Regjistrimit</h4>
                    <p className="text-gray-600">
                      {new Date(organization.created_at).toLocaleDateString("sq-AL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Informacione Kontakti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Person Kontakti</h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{organization.person_kontakti}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Email</h4>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      {isLoggedIn ? (
                        <a
                          href={`mailto:${organization.email_kontakti}`}
                          className="hover:text-[#00C896] transition-colors"
                        >
                          {organization.email_kontakti}
                        </a>
                      ) : (
                        <span className="italic text-gray-400">Kyçu për ta parë emailin</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

        
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
