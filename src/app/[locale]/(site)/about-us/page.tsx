import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function AboutUsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "about" })

  return (
    <>
      {/* Hero Section */}
      <div className="py-24 relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
              {t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/${locale}/marketplace`}>{t("hero.cta.primary")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={`/${locale}/eco-organizations`}>{t("hero.cta.secondary")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Advocacy Section */}
      <div className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              {t("advocacy.heading")}
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4">
              {t.rich("advocacy.body", {
                p: (chunks) => <p className="mb-4">{chunks}</p>,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* What you can do Section */}
      <div className="py-16 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              {t("actions.heading")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Businesses */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-6 text-gray-900">
                {t("actions.businesses.title")}
              </h3>
              <ul className="space-y-4">
                {t.raw("actions.businesses.items").map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Municipalities */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-6 text-gray-900">
                {t("actions.municipalities.title")}
              </h3>
              <ul className="space-y-4">
                {t.raw("actions.municipalities.items").map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Citizens */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-6 text-gray-900">
                {t("actions.citizens.title")}
              </h3>
              <ul className="space-y-4">
                {t.raw("actions.citizens.items").map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Inline CTA */}
          <div className="text-center">
            <p className="text-gray-700 mb-6">
              <span className="font-semibold">{t("actions.inlineCta")}</span>{" "}
              <Button asChild variant="link" className="px-0">
                <Link href={`/${locale}/marketplace`}>{t("actions.browse")}</Link>
              </Button>
              {" or "}
              <Button asChild variant="link" className="px-0">
                <Link href={`/${locale}/eco-organizations`}>{t("actions.organizations")}</Link>
              </Button>
            </p>
          </div>
        </div>
      </div>

      {/* Who Runs EcoHub Section */}
      <div className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              {t("who.heading")}
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4 mb-8">
              <p>{t("who.body")}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {t.raw("who.principles").map((principle: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
              <p className="text-gray-900 font-semibold mb-4">{t("who.cta")}</p>
              <Button asChild>
                <Link href={`/${locale}/contact`}>{t("who.ctaLink")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
