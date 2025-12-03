import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { CheckCircle } from "lucide-react"
import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { PublicPageHero } from "@/components/layout/PublicPageHero"

export default async function AboutUsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "about" })

  return (
    <>
      {/* Hero Section */}
      <PublicPageHero
        namespace="about"
        titleKey="hero.title"
        subtitleKey="hero.subtitle"
        variant="centered"
        actions={
          <>
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 rounded-full">
              <Link href="/marketplace">{t("hero.cta.primary")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/partners">{t("hero.cta.secondary")}</Link>
            </Button>
          </>
        }
      />

      {/* Advocacy Section */}
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
              {t("advocacy.heading")}
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4 max-w-none">
              {t.rich("advocacy.body", {
                p: (chunks) => <p className="mb-4">{chunks}</p>,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* What you can do Section */}
      <div className="py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
              {t("actions.heading")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Businesses */}
            <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6 hover:-translate-y-1 hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-5 text-gray-900">
                {t("actions.businesses.title")}
              </h3>
              <ul className="space-y-3">
                {t.raw("actions.businesses.items").map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Municipalities */}
            <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6 hover:-translate-y-1 hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-5 text-gray-900">
                {t("actions.municipalities.title")}
              </h3>
              <ul className="space-y-3">
                {t.raw("actions.municipalities.items").map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Citizens */}
            <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6 hover:-translate-y-1 hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-5 text-gray-900">
                {t("actions.citizens.title")}
              </h3>
              <ul className="space-y-3">
                {t.raw("actions.citizens.items").map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Inline CTA */}
          <div className="text-center">
            <p className="text-gray-700 mb-4 text-sm">
              <span className="font-semibold">{t("actions.inlineCta")}</span>{" "}
              <Button
                asChild
                variant="link"
                className="px-0 text-emerald-600 hover:text-emerald-700"
              >
                <Link href="/marketplace">{t("actions.browse")}</Link>
              </Button>
              {" or "}
              <Button
                asChild
                variant="link"
                className="px-0 text-emerald-600 hover:text-emerald-700"
              >
                <Link href="/partners">{t("actions.organizations")}</Link>
              </Button>
            </p>
          </div>
        </div>
      </div>

      {/* Who Runs EcoHub Section */}
      <div className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
              {t("who.heading")}
            </h2>
            <div className="prose prose-lg text-gray-700 space-y-4 max-w-none mb-6">
              <p>{t("who.body")}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {t.raw("who.principles").map((principle: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-gray-700 text-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6">
              <p className="text-gray-900 font-semibold mb-4">{t("who.cta")}</p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 rounded-full">
                <Link href="/contact">{t("who.ctaLink")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Support & Logos */}
      <section className="py-12 md:py-16 bg-emerald-50/60 border-t border-emerald-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {t("grant.title")}
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {t("grant.description")}
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
            <div className="h-14 md:h-16 flex items-center">
              <Image
                src="/logos/PODRSKA EICEE Obavezni logoi.png"
                alt={t("grant.fundersAlt")}
                width={10799}
                height={1188}
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="flex flex-wrap md:flex-nowrap items-center gap-6">
              <div className="h-14 md:h-16 flex items-center">
                <Image
                  src="/logos/LOGO PROJEKTA EICEE.png"
                  alt={t("grant.eiceeAlt")}
                  width={2828}
                  height={2953}
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="h-14 md:h-16 flex items-center">
                <Image
                  src="/logos/KADC-Logo_HQ.png"
                  alt={t("grant.kadcAlt")}
                  width={1443}
                  height={603}
                  className="h-full w-auto object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
