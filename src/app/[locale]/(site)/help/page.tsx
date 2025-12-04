import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { BookOpen, MessageCircle, Video, Download, ExternalLink } from "lucide-react"
import { getLocale } from "next-intl/server"
import { NdhimeCTA } from "./cta"
import { LocaleWarningBanner } from "@/components/shared/locale-warning-banner"

export default async function NdihmePage() {
  const locale = await getLocale()
  return (
    <>
      <div className="py-12">
        <div className="container px-4 md:px-6 max-w-6xl">
          <LocaleWarningBanner />
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              Qendra e <span className="text-emerald-600">Ndihmës</span>
            </h1>
            <p className="text-xl text-gray-600">
              Gjeni të gjitha burimet që ju nevojiten për të përdorur ECO HUB KOSOVA në mënyrë
              efektive
            </p>
          </div>

          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Udhëzues</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Udhëzues të detajuar për përdorimin e platformës
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="#guides">Shiko udhëzuesit</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Video className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Video Tutoriale</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">Mësoni përmes videove të shkurtra</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="#videos">Shiko videot</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <MessageCircle className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Mbështetje</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">Kontaktoni ekipin tonë për ndihmë</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/contact">Kontaktoni</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Download className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Burime</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">Shkarkoni materiale dhe template</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="#resources">Shiko burimet</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started Guide */}
          <div id="guides" className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Si të Filloni</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    1
                  </div>
                  <CardTitle className="text-center">Regjistrohuni</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Klikoni "Bashkohu në Rrjet"</li>
                    <li>• Plotësoni formularin e regjistrimit</li>
                    <li>• Konfirmoni email-in tuaj</li>
                    <li>• Prisni aprovimin (për organizata)</li>
                  </ul>
                  <NdhimeCTA />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    2
                  </div>
                  <CardTitle className="text-center">Plotësoni Profilin</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Shtoni informacione të detajuara</li>
                    <li>• Përcaktoni interesat tuaja</li>
                    <li>• Ngarkoni logo (për organizata)</li>
                    <li>• Aktivizoni njoftimet</li>
                  </ul>
                  <Button asChild className="w-full mt-4" size="sm" variant="outline">
                    <Link href="/profile">Shiko profilin</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    3
                  </div>
                  <CardTitle className="text-center">Filloni Bashkëpunimin</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Eksploroni drejtorinë e partnerëve</li>
                    <li>• Publikoni në treg</li>
                    <li>• Lexoni artikujt e dijes</li>
                    <li>• Kontaktoni partnerët</li>
                  </ul>
                  <Button asChild className="w-full mt-4" size="sm" variant="outline">
                    <Link href="/marketplace">Eksploro tani</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Feature Guides */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Udhëzues të Detajuar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Si të përdorni Tregun</CardTitle>
                  <CardDescription>Mësoni të publikoni dhe të kërkoni në treg</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm">Publikimi i një listimi</h4>
                      <p className="text-xs text-gray-600">
                        Shkoni te "Tregu" → "Shto listim të ri" dhe plotësoni formularin
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Kërkimi në treg</h4>
                      <p className="text-xs text-gray-600">
                        Përdorni filtrat për të gjetur atë që kërkoni
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Kontaktimi i shitësve</h4>
                      <p className="text-xs text-gray-600">
                        Klikoni "Shiko detajet" dhe kontaktoni drejtpërdrejt
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4" size="sm" variant="outline">
                    <Link href="/marketplace">Shiko tregun</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Si të gjeni Partnerë</CardTitle>
                  <CardDescription>Udhëzime për rrjetëzim dhe bashkëpunim</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm">Kërkimi në drejtori</h4>
                      <p className="text-xs text-gray-600">
                        Përdorni filtrat për llojin e organizatës dhe vendndodhjen
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Shikimi i profileve</h4>
                      <p className="text-xs text-gray-600">
                        Lexoni përshkrimet dhe interesat e organizatave
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Kontaktimi</h4>
                      <p className="text-xs text-gray-600">
                        Përdorni butonin "Shpreh interes" për të filluar bisedën
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4" size="sm" variant="outline">
                    <Link href="/partners">Shiko drejtorinë</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Qendra e Dijes</CardTitle>
                  <CardDescription>Si të përdorni burimet edukative</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm">Leximi i artikujve</h4>
                      <p className="text-xs text-gray-600">
                        Eksploroni artikujt e kategorizuar sipas temave
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Kërkimi i përmbajtjes</h4>
                      <p className="text-xs text-gray-600">
                        Përdorni funksionin e kërkimit për tema specifike
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Ndarja e artikujve</h4>
                      <p className="text-xs text-gray-600">
                        Ndani artikujt me rrjetin tuaj për të rritur ndikimin
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4" size="sm" variant="outline">
                    <Link href="/knowledge">Shiko artikujt</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Menaxhimi i Profilit</CardTitle>
                  <CardDescription>Përditësoni dhe optimizoni profilin tuaj</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm">Informacionet bazë</h4>
                      <p className="text-xs text-gray-600">
                        Mbani të përditësuara të dhënat e kontaktit
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Përshkrimi i organizatës</h4>
                      <p className="text-xs text-gray-600">
                        Shkruani një përshkrim tërheqës dhe informativ
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Interesat dhe ekspertiza</h4>
                      <p className="text-xs text-gray-600">
                        Specifikoni fushat tuaja të interesit dhe ekspertizës
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4" size="sm" variant="outline">
                    <Link href="/profile">Përditëso profilin</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Video Tutorials */}
          <div id="videos" className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Video Tutoriale</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Regjistrimi në Platformë</CardTitle>
                  <CardDescription>5 minuta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Mësoni si të regjistroheni dhe të aktivizoni llogarinë tuaj
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Shiko videon
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Përdorimi i Tregut</CardTitle>
                  <CardDescription>8 minuta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Si të publikoni dhe të kërkoni në tregun e ekonomisë qarkore
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Shiko videon
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gjetja e Partnerëve</CardTitle>
                  <CardDescription>6 minuta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Strategji për të gjetur dhe kontaktuar partnerët e duhur
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Shiko videon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Resources */}
          <div id="resources" className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Burime për Shkarkime</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template dhe Formularë</CardTitle>
                  <CardDescription>Materiale të gatshme për përdorim</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Template për propozim projekti</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Shkarko
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Formular për partneritet</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Shkarko
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Udhëzues për ekonomi qarkore</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Shkarko
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Materiale Promovuese</CardTitle>
                  <CardDescription>Materiale për promovimin e platformës</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Logo të ECO HUB KOSOVA</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Shkarko
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Broshura informative</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Shkarko
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Prezantim për organizata</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Shkarko
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Support */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Keni nevojë për ndihmë shtesë?</CardTitle>
              <CardDescription>
                Ekipi ynë është gati t'ju ndihmojë me çdo pyetje ose problem
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/contact">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Kontaktoni mbështetjen
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/faq">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Shiko FAQ
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
