import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Target, Globe, Users, CheckCircle, ArrowRight } from "lucide-react"
import { RrethNeshHeroCTA, RrethNeshBottomCTA } from "./cta"
import { getTranslations } from "next-intl/server"

export default async function RrethNeshPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "about" })

  return (
    <>
      {/* Hero Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center rounded-full glass-card px-4 py-2 text-sm font-semibold mb-8 transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4 mr-2 text-emerald-600" />
              {t("hero.badge")}
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
              {t("hero.titleStart")}{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                {t("hero.titleEnd")}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <RrethNeshHeroCTA />
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
            <div className="glass-card p-8 rounded-2xl hover-lift text-left space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{t("mission.title")}</h3>
              <p className="text-gray-600">{t("mission.description1")}</p>
              <p className="text-gray-600">{t("mission.description2")}</p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover-lift text-left space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{t("vision.title")}</h3>
              <p className="text-gray-600">{t("vision.description1")}</p>
              <p className="text-gray-600">{t("vision.description2")}</p>
            </div>
          </div>

          {/* Values Grid */}
          <div className="mt-24 mb-16 text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-8">{t("values.title")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                [t("values.sustainability.title"), t("values.sustainability.desc")],
                [t("values.collaboration.title"), t("values.collaboration.desc")],
                [t("values.transparency.title"), t("values.transparency.desc")],
                [t("values.innovation.title"), t("values.innovation.desc")],
              ].map(([title, desc]) => (
                <div key={title} className="glass-card p-6 rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-lg">{title}</h4>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Highlight */}
          <div className="text-center animate-fade-in-up mb-24">
            <h2 className="text-3xl font-bold mb-8">{t("team.title")}</h2>
            <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur rounded-2xl shadow p-8">
              <Users className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("team.subtitle")}</h3>
              <p className="text-gray-600 mb-6">{t("team.description")}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-emerald-600">{t("team.experts.title")}</h4>
                  <p className="text-sm text-gray-600">{t("team.experts.desc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-600">{t("team.business.title")}</h4>
                  <p className="text-sm text-gray-600">{t("team.business.desc")}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-600">{t("team.activists.title")}</h4>
                  <p className="text-sm text-gray-600">{t("team.activists.desc")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="glass-card max-w-2xl mx-auto p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">{t("cta.title")}</h2>
              <p className="text-gray-600 mb-6">{t("cta.description")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <RrethNeshBottomCTA />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
