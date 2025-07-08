import { BaseLayout } from "@/components/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building, Users, MapPin } from "lucide-react"

export default function PartnerePage() {
  return (
    <BaseLayout>
      <div className="py-12">
        <div className="container px-4 md:px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              Partnerët <span className="text-emerald-600">Tanë</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Zbulo rrjetin tonë të partnerëve të angazhuar në ekonominë qarkulluese të Kosovës
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Building className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                <CardTitle className="text-3xl font-bold">50+</CardTitle>
                <CardDescription>Organizata Partnere</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                <CardTitle className="text-3xl font-bold">200+</CardTitle>
                <CardDescription>Anëtarë Aktivë</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                <CardTitle className="text-3xl font-bold">7</CardTitle>
                <CardDescription>Qytete të Kosovës</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Partner Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Llojet e Partnerëve</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-emerald-600">Organizata Joqeveritare</CardTitle>
                  <CardDescription>
                    OJQ-të që punojnë për promovimin e qëndrueshmërisë dhe ekonomisë qarkulluese
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Edukimi mjedisor</li>
                    <li>• Sensibilizimi i publikut</li>
                    <li>• Projekte komunitare</li>
                    <li>• Advokimi për politika</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-emerald-600">Ndërmarrje Sociale</CardTitle>
                  <CardDescription>Biznese që kombinojnë qëllimet sociale me qëndrueshmërinë ekonomike</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Inovacione të gjelbra</li>
                    <li>• Punësimi i grupeve vulnerabël</li>
                    <li>• Zgjidhje të qëndrueshme</li>
                    <li>• Impakti social</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-emerald-600">Kompani</CardTitle>
                  <CardDescription>
                    Biznese që kanë integruar parimet e ekonomisë qarkulluese në operacionet e tyre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Riciklimi dhe ripërdorimi</li>
                    <li>• Energjia e ripërtëritshme</li>
                    <li>• Prodhimi i qëndrueshëm</li>
                    <li>• Zinxhiri i furnizimit të gjelbër</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Bëhu Partner</CardTitle>
                <CardDescription>
                  Bashkohu me rrjetin tonë të partnerëve dhe kontribuo në ekonominë qarkulluese të Kosovës
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/drejtoria">Shiko të gjithë partnerët</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/auth/regjistrohu">Regjistrohu si partner</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
