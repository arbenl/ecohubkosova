import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { Sparkles, Users, Leaf, ArrowRight } from "lucide-react"
import { EksploroCTA } from "./cta"
import { getTranslations } from "next-intl/server"

export default async function EksploroPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "explore" })

  return (
    <>
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
        <div className="container px-4 md:px-6 relative">
          {/* Hero Section */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center rounded-full glass-card px-4 py-2 text-sm font-semibold mb-8 transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
              {t("hero.badge")}
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
              {t("hero.titleStart")}{" "}
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                {t("hero.titleEnd")}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <EksploroCTA />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
            <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{t("features.networking.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("features.networking.description")}
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Leaf className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {t("features.sustainability.title")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("features.sustainability.description")}
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{t("features.innovation.title")}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t("features.innovation.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
