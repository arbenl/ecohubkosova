import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/i18n/routing"
import { Leaf, Droplet, Zap, Recycle, Award, Lightbulb } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function SustainabilityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "sustainability" })

  // Map icon names to components
  const iconMap: Record<string, React.ComponentType<{ className: string }>> = {
    Leaf,
    Droplet,
    Zap,
    Recycle,
    Award,
    Lightbulb,
  }

  return (
    <>
      {/* Hero Section */}
      <div className="py-24 relative overflow-hidden bg-gradient-to-br from-green-50 to-teal-100">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center text-gray-900">
              {t("mission.heading")}
            </h2>
            <div className="bg-green-50 p-8 rounded-lg border-2 border-green-200">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">{t("mission.body")}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/about-us">{t("mission.cta")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pillars Section */}
      <div className="py-16 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <h2 className="text-4xl font-bold mb-4 text-center text-gray-900 mb-16">
            {t("pillars.heading")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {t.raw("pillars.items").map((pillar: any, idx: number) => {
              const IconComponent = pillar.icon ? iconMap[pillar.icon] || Leaf : Leaf

              return (
                <Card key={idx} className="border-t-4 border-t-green-600">
                  <CardContent className="pt-6">
                    <IconComponent className="w-12 h-12 text-green-600 mb-4" />
                    <h3 className="text-lg font-bold mb-3 text-gray-900">{pillar.title}</h3>
                    <p className="text-gray-700 mb-4">{pillar.description}</p>
                    {pillar.points && (
                      <ul className="space-y-2 text-sm text-gray-600">
                        {pillar.points.map((point: string, pidx: number) => (
                          <li key={pidx} className="flex items-start gap-2">
                            <span className="text-green-600 font-bold mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-4xl font-bold mb-4 text-center text-gray-900 mb-16">
            {t("impact.heading")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {t.raw("impact.metrics").map((metric: any, idx: number) => (
              <div
                key={idx}
                className="text-center bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-lg"
              >
                <div className="text-4xl font-bold text-green-600 mb-2">{metric.value}</div>
                <p className="text-gray-700 font-semibold">{metric.label}</p>
              </div>
            ))}
          </div>

          {/* Impact description */}
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-700 leading-relaxed">{t("impact.description")}</p>
          </div>
        </div>
      </div>

      {/* Certification Section */}
      <div className="py-16 md:py-24 bg-teal-50">
        <div className="container px-4 md:px-6">
          <h2 className="text-4xl font-bold mb-4 text-center text-gray-900 mb-16">
            {t("certification.heading")}
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-teal-200 mb-8">
              <Award className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{t("certification.title")}</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">{t("certification.body")}</p>
              <ul className="space-y-3 mb-8">
                {t.raw("certification.standards").map((standard: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-gray-700">
                    <span className="text-teal-600 font-bold">✓</span>
                    <span>{standard}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link href="/partners">{t("certification.cta")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Partnership Section */}
      <div className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-4xl font-bold mb-4 text-center text-gray-900 mb-16">
            {t("partnerships.heading")}
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="bg-green-50 p-8 rounded-lg border border-green-200 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{t("partnerships.title")}</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">{t("partnerships.body")}</p>
              <ul className="space-y-3">
                {t.raw("partnerships.partners").map((partner: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-gray-700">
                    <span className="text-green-600 font-bold">→</span>
                    <span>{partner}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 md:py-24 bg-gradient-to-r from-green-600 to-teal-600">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t("cta.heading")}</h2>
          <p className="text-lg text-green-50 max-w-2xl mx-auto mb-8">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              <Link href="/marketplace">{t("cta.browse")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href="/contact">{t("cta.partner")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
