import { BaseLayout } from "@/components/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function KontaktiPage() {
  return (
    <BaseLayout>
      <div className="py-12">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              <span className="text-emerald-600">Kontakti</span>
            </h1>
            <p className="text-xl text-gray-600">Na kontaktoni për çdo pyetje, sugjerim apo bashkëpunim</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Dërgoni një mesazh</CardTitle>
                <CardDescription>
                  Plotësoni formularin më poshtë dhe ne do t'ju përgjigjemi sa më shpejt të jetë e mundur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Emri</Label>
                      <Input id="firstName" placeholder="Emri juaj" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Mbiemri</Label>
                      <Input id="lastName" placeholder="Mbiemri juaj" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@shembull.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organizata (opsionale)</Label>
                    <Input id="organization" placeholder="Emri i organizatës" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subjekti</Label>
                    <Input id="subject" placeholder="Subjekti i mesazhit" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mesazhi</Label>
                    <Textarea id="message" placeholder="Shkruani mesazhin tuaj këtu..." rows={5} />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                    Dërgo Mesazhin
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informacionet e kontaktit</CardTitle>
                  <CardDescription>Mund të na kontaktoni përmes mënyrave të mëposhtme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">info@ecohubkosova.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">Telefoni</p>
                      <p className="text-sm text-gray-600">+383 49 123 456</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">Adresa</p>
                      <p className="text-sm text-gray-600">
                        Rruga "Nëna Terezë" Nr. 10
                        <br />
                        10000 Prishtinë, Kosovë
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">Orari i punës</p>
                      <p className="text-sm text-gray-600">
                        E hënë - E premte: 09:00 - 17:00
                        <br />E shtunë: 09:00 - 13:00
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Zyrat rajonale</CardTitle>
                  <CardDescription>Gjeni zyrën më të afërt me ju</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-emerald-600">Prishtinë (Zyra Kryesore)</h3>
                    <p className="text-sm text-gray-600">Rruga "Nëna Terezë" Nr. 10</p>
                    <p className="text-sm text-gray-600">Tel: +383 49 123 456</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600">Prizren</h3>
                    <p className="text-sm text-gray-600">Rruga "Shkëndija" Nr. 25</p>
                    <p className="text-sm text-gray-600">Tel: +383 49 123 457</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600">Pejë</h3>
                    <p className="text-sm text-gray-600">Rruga "Adem Jashari" Nr. 15</p>
                    <p className="text-sm text-gray-600">Tel: +383 49 123 458</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rrjetet sociale</CardTitle>
                  <CardDescription>Ndiqni përditësimet tona në rrjetet sociale</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm">
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm">
                      LinkedIn
                    </Button>
                    <Button variant="outline" size="sm">
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm">
                      Instagram
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
