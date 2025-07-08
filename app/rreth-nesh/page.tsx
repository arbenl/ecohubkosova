import { BaseLayout } from "@/components/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Target, Users, Globe, ArrowRight, CheckCircle } from "lucide-react"

export default function RrethNeshPage() {
  return (
    <BaseLayout>
      <div className="py-12">
        <div className="container px-4 md:px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              Rreth <span className="text-emerald-600">Nesh</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ECO HUB KOSOVA është platforma e parë e ekonomisë qarkulluese në Kosovë, e krijuar për të lidhur
              partnerët, promovuar bashkëpunimin dhe ndërtuar një ekonomi të qëndrueshme.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-emerald-600 mb-4" />
                <CardTitle>Misioni Ynë</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Të krijojmë një platformë që lehtëson bashkëpunimin midis organizatave, bizneseve dhe individëve për
                  të ndërtuar një ekonomi qarkulluese të qëndrueshme në Kosovë.
                </p>
                <p className="text-gray-600">
                  Ne besojmë se përmes rrjetëzimit, shkëmbimit të njohurive dhe bashkëpunimit, mund të krijojmë një të
                  ardhme më të gjelbër dhe më të qëndrueshme për të gjithë.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-emerald-600 mb-4" />
                <CardTitle>Vizioni Ynë</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Të bëhemi platforma kryesore për ekonominë qarkulluese në Ballkanin Perëndimor, duke shërbyer si model
                  për vendet e tjera në rajon.
                </p>
                <p className="text-gray-600">
                  Synojmë një Kosovë ku mbetjet minimizohen, burimet ripërdoren dhe ekonomia zhvillohet në harmoni me
                  mjedisin.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Our Values */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Vlerat Tona</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Qëndrueshmëria</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Promovojmë praktikat që ruajnë mjedisin dhe sigurojnë një të ardhme të qëndrueshme.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Bashkëpunimi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Besojmë në fuqinë e bashkëpunimit për të arritur qëllime të përbashkëta.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Transparenca</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Operojmë me transparencë të plotë dhe përgjegjësi ndaj komunitetit.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Inovacioni</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Mbështesim zgjidhjet inovative për sfidat e ekonomisë qarkulluese.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* What We Do */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Çfarë Bëjmë</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Rrjetëzimi i Partnerëve</CardTitle>
                  <CardDescription>Lidhim organizatat, bizneset dhe individët</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Drejtoria e organizatave dhe kompanive</li>
                    <li>• Platforma për komunikim dhe bashkëpunim</li>
                    <li>• Evente dhe takime rrjetëzimi</li>
                    <li>• Mundësi partneriteti dhe bashkëpunimit</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tregu i Ekonomisë Qarkulluese</CardTitle>
                  <CardDescription>Lehtësojmë shkëmbimin e burimeve</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Treg për materiale të riciklueshme</li>
                    <li>• Shërbime të qëndrueshme</li>
                    <li>• Produkte të ekonomisë qarkulluese</li>
                    <li>• Platforma për blerje dhe shitje</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Qendra e Dijes</CardTitle>
                  <CardDescription>Ndajmë njohuri dhe ekspertizë</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Artikuj dhe studime hulumtuese</li>
                    <li>• Udhëzues dhe praktika të mira</li>
                    <li>• Raportet e industrisë</li>
                    <li>• Burime edukative</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mbështetja e Projekteve</CardTitle>
                  <CardDescription>Ndihmojmë në realizimin e projekteve</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Konsulencë për projekte të qëndrueshme</li>
                    <li>• Lidhje me financuesit dhe donatorët</li>
                    <li>• Mbështetje teknike dhe ekspertizë</li>
                    <li>• Monitorimi dhe vlerësimi</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Ekipi Ynë</h2>
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Users className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Koalicioni i Ekonomisë Qarkulluese</h3>
                  <p className="text-gray-600">
                    ECO HUB KOSOVA është mbështetur nga Koalicioni i Ekonomisë Qarkulluese, një grup organizatash dhe
                    ekspertësh të angazhuar për promovimin e ekonomisë qarkulluese në Kosovë.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <h4 className="font-semibold text-emerald-600">Ekspertë Mjedisore</h4>
                    <p className="text-sm text-gray-600">Specialistë në qëndrueshmëri dhe mjedis</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-600">Liderë Biznesesh</h4>
                    <p className="text-sm text-gray-600">Përfaqësues të sektorit privat</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-600">Aktivistë Socialë</h4>
                    <p className="text-sm text-gray-600">Përfaqësues të shoqërisë civile</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Bashkohu me Ne</CardTitle>
                <CardDescription>Bëhu pjesë e lëvizjes për një ekonomi më të qëndrueshme në Kosovë</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/auth/regjistrohu">
                      Regjistrohu tani <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/kontakti">Na kontaktoni</Link>
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
