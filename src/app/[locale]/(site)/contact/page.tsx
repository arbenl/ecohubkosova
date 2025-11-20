import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function KontaktiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "contact" })

  return (
    <>
      <div className="py-12">
        <div className="container px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-4">
              <span className="text-emerald-600">{t("title")}</span>
            </h1>
            <p className="text-xl text-gray-600">{t("subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t("form.title")}</CardTitle>
                <CardDescription>{t("form.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("form.firstName")}</Label>
                      <Input id="firstName" placeholder={t("form.firstNamePlaceholder")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("form.lastName")}</Label>
                      <Input id="lastName" placeholder={t("form.lastNamePlaceholder")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("form.email")}</Label>
                    <Input id="email" type="email" placeholder={t("form.emailPlaceholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">{t("form.organization")}</Label>
                    <Input id="organization" placeholder={t("form.organizationPlaceholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("form.subject")}</Label>
                    <Input id="subject" placeholder={t("form.subjectPlaceholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t("form.message")}</Label>
                    <Textarea id="message" placeholder={t("form.messagePlaceholder")} rows={5} />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                    {t("form.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("info.title")}</CardTitle>
                  <CardDescription>{t("info.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">{t("info.email")}</p>
                      <p className="text-sm text-gray-600">info@ecohubkosova.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">{t("info.phone")}</p>
                      <p className="text-sm text-gray-600">+383 49 123 456</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">{t("info.address")}</p>
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
                      <p className="font-medium">{t("info.hours")}</p>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {t("info.hoursValue")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("offices.title")}</CardTitle>
                  <CardDescription>{t("offices.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-emerald-600">{t("offices.prishtina")}</h3>
                    <p className="text-sm text-gray-600">Rruga "Nëna Terezë" Nr. 10</p>
                    <p className="text-sm text-gray-600">Tel: +383 49 123 456</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600">{t("offices.prizren")}</h3>
                    <p className="text-sm text-gray-600">Rruga "Shkëndija" Nr. 25</p>
                    <p className="text-sm text-gray-600">Tel: +383 49 123 457</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600">{t("offices.peja")}</h3>
                    <p className="text-sm text-gray-600">Rruga "Adem Jashari" Nr. 15</p>
                    <p className="text-sm text-gray-600">Tel: +383 49 123 458</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("social.title")}</CardTitle>
                  <CardDescription>{t("social.description")}</CardDescription>
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
    </>
  )
}
