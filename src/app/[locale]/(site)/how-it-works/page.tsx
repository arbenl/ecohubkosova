import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "howItWorks" })

  return (
    <>
      {/* Hero Section */}
      <div className="py-24 relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-100">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* For Consumers Section */}
      <div className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-4xl font-bold mb-4 text-center text-gray-900 mb-16">
            {t("consumers.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {t.raw("consumers.steps").map((step: any, idx: number) => (
              <div key={idx} className="relative">
                <div className="bg-white p-6 rounded-lg border-2 border-blue-200 h-full">
                  <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4 flex-shrink-0">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow */}
                {idx < 3 && (
                  <div className="hidden md:flex absolute top-1/3 -right-6 text-blue-400">
                    <ArrowRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href={`/${locale}/marketplace`}>{t("consumers.cta")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* For Sellers Section */}
      <div className="py-16 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <h2 className="text-4xl font-bold mb-4 text-center text-gray-900 mb-16">
            {t("sellers.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {t.raw("sellers.steps").map((step: any, idx: number) => (
              <div key={idx} className="relative">
                <div className="bg-white p-6 rounded-lg border-2 border-green-200 h-full">
                  <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4 flex-shrink-0">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow */}
                {idx < 3 && (
                  <div className="hidden md:flex absolute top-1/3 -right-6 text-green-400">
                    <ArrowRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-12">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href={`/${locale}/marketplace/create-listing`}>{t("sellers.cta")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="text-4xl font-bold mb-4 text-center text-gray-900 mb-16">
            {t("features.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {t.raw("features.items").map((feature: any, idx: number) => (
              <Card key={idx} className="border-l-4 border-l-emerald-600">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ-style Benefits Section */}
      <div className="py-16 md:py-24 bg-emerald-50">
        <div className="container px-4 md:px-6">
          <h2 className="text-4xl font-bold mb-4 text-center text-gray-900 mb-16">
            {t("benefits.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {t.raw("benefits.items").map((benefit: any, idx: number) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-lg shadow-sm border border-emerald-200"
              >
                <h3 className="text-lg font-bold mb-4 text-gray-900">{benefit.title}</h3>
                <ul className="space-y-3">
                  {benefit.points.map((point: string, pidx: number) => (
                    <li key={pidx} className="flex gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-cyan-600">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t("cta.heading")}</h2>
          <p className="text-lg text-emerald-50 max-w-2xl mx-auto mb-8">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
              <Link href={`/${locale}/marketplace`}>{t("cta.browse")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href={`/${locale}/marketplace/create-listing`}>{t("cta.sell")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
