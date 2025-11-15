import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, Lightbulb, Globe } from "lucide-react"

export default function KoalicioniPage() {
  return (
    <>
      <div className="py-12">
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              Koalicioni i <span className="text-emerald-600">Ekonomisë Qarkulluese</span>
            </h1>
            <p className="text-xl text-gray-600">
              Një aleancë e organizatave, bizneseve dhe ekspertëve të angazhuar për ekonominë qarkulluese në Kosovë
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Rreth Koalicionit</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Koalicioni i Ekonomisë Qarkulluese është një aleancë strategjike e organizatave joqeveritare,
                  ndërmarrjeve sociale, kompanive dhe ekspertëve individualë që punojnë së bashku për të promovuar dhe
                  implementuar parimet e ekonomisë qarkulluese në Kosovë.
                </p>
                <p>
                  I themeluar në vitin 2023, koalicioni ka për qëllim të krijojë një zë të unifikuar për ekonominë
                  qarkulluese dhe të koordinojë përpjekjet për një tranzicion të suksesshëm drejt një modeli ekonomik më
                  të qëndrueshëm.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-emerald-600 mb-4" />
                  <CardTitle>Anëtarësia</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Koalicioni përbëhet nga më shumë se 30 organizata dhe ekspertë nga sektorë të ndryshëm:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 15 Organizata Joqeveritare</li>
                    <li>• 8 Ndërmarrje Sociale</li>
                    <li>• 5 Kompani Private</li>
                    <li>• 12 Ekspertë Individualë</li>
                    <li>• 3 Institucione Akademike</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Building className="h-12 w-12 text-emerald-600 mb-4" />
                  <CardTitle>Struktura</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Koalicioni është organizuar në grupe pune tematike:</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Grupi i Punës për Politika</li>
                    <li>• Grupi i Punës për Edukimin</li>
                    <li>• Grupi i Punës për Teknologji</li>
                    <li>• Grupi i Punës për Financim</li>
                    <li>• Grupi i Punës për Komunikim</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Objektivat e Koalicionit</CardTitle>
                <CardDescription>Qëllimet kryesore që na bashkojnë si koalicion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-emerald-600 mb-2">Advokimi për Politika</h3>
                      <p className="text-sm text-gray-600">
                        Punojmë me institucionet qeveritare për të krijuar një kornizë ligjore që mbështet ekonominë
                        qarkulluese.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-600 mb-2">Ndërtimi i Kapaciteteve</h3>
                      <p className="text-sm text-gray-600">
                        Organizojmë trajnime dhe workshop-e për të rritur kapacitetet e anëtarëve dhe komunitetit.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-600 mb-2">Hulumtimi dhe Zhvillimi</h3>
                      <p className="text-sm text-gray-600">
                        Kryejmë hulumtime për të identifikuar mundësitë dhe sfidat e ekonomisë qarkulluese në Kosovë.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-emerald-600 mb-2">Rrjetëzimi dhe Bashkëpunimi</h3>
                      <p className="text-sm text-gray-600">
                        Lehtësojmë bashkëpunimin midis anëtarëve dhe krijojmë sinergji për projekte të përbashkëta.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-600 mb-2">Sensibilizimi i Publikut</h3>
                      <p className="text-sm text-gray-600">
                        Rrisim ndërgjegjësimin e publikut për rëndësinë e ekonomisë qarkulluese.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-600 mb-2">Bashkëpunimi Ndërkombëtar</h3>
                      <p className="text-sm text-gray-600">
                        Krijojmë lidhje me rrjete të ngjashme në rajon dhe në Evropë.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anëtarët Themelues</CardTitle>
                <CardDescription>Organizatat që themeluan koalicionin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-emerald-600 mb-2">Qendra për Ekonomi Qarkulluese</h3>
                    <p className="text-xs text-gray-600">OJQ - Prishtinë</p>
                    <p className="text-sm text-gray-600 mt-2">Lider në promovimin e ekonomisë qarkulluese</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-emerald-600 mb-2">EcoTech Solutions</h3>
                    <p className="text-xs text-gray-600">Kompani - Prizren</p>
                    <p className="text-sm text-gray-600 mt-2">Zgjidhje teknologjike për qëndrueshmëri</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-emerald-600 mb-2">Green Future Kosovo</h3>
                    <p className="text-xs text-gray-600">Ndërmarrje Sociale - Pejë</p>
                    <p className="text-sm text-gray-600 mt-2">Projekte të gjelbra dhe energji e ripërtëritshme</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-emerald-600 mb-2">Reciklimi Plus</h3>
                    <p className="text-xs text-gray-600">Kompani - Gjilan</p>
                    <p className="text-sm text-gray-600 mt-2">Riciklim dhe menaxhim mbetjesh</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-emerald-600 mb-2">Bujqësia e Qëndrueshme</h3>
                    <p className="text-xs text-gray-600">OJQ - Ferizaj</p>
                    <p className="text-sm text-gray-600 mt-2">Promovimi i bujqësisë organike</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold text-emerald-600 mb-2">Universiteti i Prishtinës</h3>
                    <p className="text-xs text-gray-600">Institucion Akademik</p>
                    <p className="text-sm text-gray-600 mt-2">Hulumtime dhe zhvillim</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <Lightbulb className="h-12 w-12 text-emerald-600 mb-4" />
                  <CardTitle>Arritjet Deri Tani</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <span>Krijimi i ECO HUB KOSOVA platformës</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <span>Organizimi i 12 eventeve të rrjetëzimit</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <span>Publikimi i 25 artikujve edukativë</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <span>Mbështetja e 15 projekteve pilot</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                      <span>Krijimi i partneriteteve ndërkombëtare</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Globe className="h-12 w-12 text-emerald-600 mb-4" />
                  <CardTitle>Plani i Ardhshëm</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <span>Zgjerimi i anëtarësisë në 50 organizata</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <span>Krijimi i fondit për projekte të ekonomisë qarkulluese</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <span>Zhvillimi i certifikimit për ekonomi qarkulluese</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <span>Krijimi i rrjetit rajonal të ekonomisë qarkulluese</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <span>Organizimi i konferencës së parë rajonale</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Si të Bashkohesh</CardTitle>
                <CardDescription>Hapat për t'u bërë anëtar i koalicionit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      1
                    </div>
                    <h3 className="font-semibold mb-2">Apliko</h3>
                    <p className="text-sm text-gray-600">
                      Plotëso formularin e aplikimit dhe na trego se si mund të kontribuosh.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      2
                    </div>
                    <h3 className="font-semibold mb-2">Vlerëso</h3>
                    <p className="text-sm text-gray-600">
                      Komiteti i anëtarësisë do të shqyrtojë aplikimin tënd dhe do të të kontaktojë.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      3
                    </div>
                    <h3 className="font-semibold mb-2">Bashkohu</h3>
                    <p className="text-sm text-gray-600">
                      Pas aprovimit, do të ftohesh në takimin e radhës dhe do të bëhesh anëtar i plotë.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
}
