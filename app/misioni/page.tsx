import { BaseLayout } from "@/components/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Eye, Heart, Lightbulb } from "lucide-react"

export default function MisioniPage() {
  return (
    <BaseLayout>
      <div className="py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              Misioni <span className="text-emerald-600">Ynë</span>
            </h1>
            <p className="text-xl text-gray-600">
              Të ndërtojmë një ekonomi qarkulluese të qëndrueshme në Kosovë përmes bashkëpunimit dhe inovacionit
            </p>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    Ne synojmë të jemi katalizatori që transformon mënyrën se si Kosova menaxhon burimet, krijon vlerë
                    dhe ndërton një të ardhme të qëndrueshme.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Eye className="h-12 w-12 text-emerald-600 mb-4" />
                  <CardTitle>Vizioni Ynë</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Të bëhemi platforma kryesore për ekonominë qarkulluese në Ballkanin Perëndimor, duke shërbyer si
                    model për vendet e tjera në rajon.
                  </p>
                  <p className="text-gray-600">
                    Synojmë një Kosovë ku mbetjet minimizohen, burimet ripërdoren dhe ekonomia zhvillohet në harmoni me
                    mjedisin.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Objektivat Strategjike</CardTitle>
                <CardDescription>Qëllimet kryesore që na udhëheqin drejt realizimit të misionit tonë</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <div>
                        <h3 className="font-semibold">Rrjetëzimi i Partnerëve</h3>
                        <p className="text-sm text-gray-600">
                          Të lidhim të paktën 100 organizata dhe biznese në rrjetin tonë brenda vitit të parë.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <div>
                        <h3 className="font-semibold">Shkëmbimi i Burimeve</h3>
                        <p className="text-sm text-gray-600">
                          Të lehtësojmë shkëmbimin e 1000 tonë materiale të riciklueshme në vit.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <div>
                        <h3 className="font-semibold">Edukimi dhe Sensibilizimi</h3>
                        <p className="text-sm text-gray-600">
                          Të publikojmë 50 artikuj edukativë dhe të organizojmë 12 evente në vit.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <div>
                        <h3 className="font-semibold">Mbështetja e Projekteve</h3>
                        <p className="text-sm text-gray-600">
                          Të mbështesim realizimin e 25 projekteve të ekonomisë qarkulluese.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <div>
                        <h3 className="font-semibold">Inovacioni Teknologjik</h3>
                        <p className="text-sm text-gray-600">
                          Të zhvillojmë mjete digjitale që lehtësojnë ekonominë qarkulluese.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <div>
                        <h3 className="font-semibold">Ndikimi Rajonal</h3>
                        <p className="text-sm text-gray-600">
                          Të zgjerojmë modelin tonë në vendet e tjera të Ballkanit Perëndimor.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parimet Udhëheqëse</CardTitle>
                <CardDescription>Vlerat që formësojnë çdo aspekt të punës sonë</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Heart className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Përkushtimi</h3>
                    <p className="text-sm text-gray-600">
                      Jemi të përkushtuar ndaj misionit tonë dhe komunitetit që shërbejmë.
                    </p>
                  </div>
                  <div className="text-center">
                    <Lightbulb className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Kreativiteti</h3>
                    <p className="text-sm text-gray-600">
                      Kërkojmë zgjidhje kreative për sfidat komplekse të ekonomisë qarkulluese.
                    </p>
                  </div>
                  <div className="text-center">
                    <Target className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Fokusi</h3>
                    <p className="text-sm text-gray-600">
                      Mbajmë fokus të qartë në objektivat tanë dhe rezultatet e matshme.
                    </p>
                  </div>
                  <div className="text-center">
                    <Eye className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Transparenca</h3>
                    <p className="text-sm text-gray-600">
                      Operojmë me transparencë të plotë dhe përgjegjësi ndaj komunitetit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Si e Realizojmë Misionin</CardTitle>
                <CardDescription>Strategjitë dhe metodat që përdorim për të arritur qëllimet tona</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">1. Ndërtimi i Rrjetit</h3>
                    <p className="text-gray-600">
                      Krijojmë një rrjet të fortë partnerësh përmes eventeve, takimeve dhe platformës digjitale që
                      lehtëson komunikimin dhe bashkëpunimin.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">2. Shkëmbimi i Njohurive</h3>
                    <p className="text-gray-600">
                      Organizojmë trajnime, workshop-e dhe publikojmë materiale edukative për të rritur ndërgjegjësimin
                      dhe kapacitetet.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">3. Lehtësimi i Tregut</h3>
                    <p className="text-gray-600">
                      Krijojmë një treg digjital ku organizatat mund të shkëmbejnë burime, materiale dhe shërbime në
                      mënyrë efikase.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-2">4. Mbështetja Teknike</h3>
                    <p className="text-gray-600">
                      Ofrojmë konsulencë dhe mbështetje teknike për organizatat që dëshirojnë të implementojnë projekte
                      të ekonomisë qarkulluese.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
