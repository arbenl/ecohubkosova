import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import {
  UserPlus,
  Search,
  MessageCircle,
  ShoppingCart,
  Sparkles,
  Leaf,
  Users,
  LogIn,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "home" })

  return (
    <>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 eco-gradient-light"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center text-center space-y-10 animate-fade-in">
              <div className="inline-flex items-center rounded-full glass-card px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105">
                <Sparkles className="w-4 h-4 mr-2 text-[#00C896]" />
                {t("hero.supportedBy")}
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                {t("hero.titleStart")}{" "}
                <span className="bg-gradient-to-r from-[#00C896] to-[#00A07E] bg-clip-text text-transparent font-extrabold">
                  {t("hero.titleEnd")}
                </span>
              </h1>

              <p className="max-w-4xl text-xl md:text-2xl text-gray-600 leading-relaxed">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Button
                  size="lg"
                  className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/register">
                    <UserPlus className="mr-2 h-5 w-5" />
                    {t("hero.ctaRegister")}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 border-2 border-[#00C896] text-[#00C896] hover:bg-[#00C896] hover:text-white"
                  asChild
                >
                  <Link href="/marketplace">
                    <Search className="mr-2 h-5 w-5" />
                    {t("hero.ctaMarketplace")}
                  </Link>
                </Button>
              </div>

              {/* Auth Links - Always visible, no auth state checking */}
              <div className="flex items-center gap-4 pt-6">
                <span className="text-gray-500 text-sm">{t("hero.haveAccount")}</span>
                <Button
                  variant="link"
                  className="text-[#00C896] hover:text-[#00A07E] p-0 h-auto font-semibold"
                  asChild
                >
                  <Link href="/login">
                    <LogIn className="mr-1 h-4 w-4" />
                    {t("hero.signIn")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 relative">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6 mb-16 animate-slide-up">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                {t("howItWorks.title")}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                {t("howItWorks.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group animate-slide-in-left">
                <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6 h-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <UserPlus className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{t("howItWorks.step1Title")}</h3>
                  <p className="text-gray-600 leading-relaxed">{t("howItWorks.step1Body")}</p>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/25 text-white rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link href="/marketplace">
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t("howItWorks.step1Cta")}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="group animate-slide-up">
                <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6 h-full bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{t("howItWorks.step2Title")}</h3>
                  <p className="text-gray-600 leading-relaxed">{t("howItWorks.step2Body")}</p>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/25 text-white rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link href="/partners">
                      <Search className="mr-2 h-4 w-4" />
                      {t("howItWorks.step2Cta")}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="group animate-slide-in-right">
                <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6 h-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MessageCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{t("howItWorks.step3Title")}</h3>
                  <p className="text-gray-600 leading-relaxed">{t("howItWorks.step3Body")}</p>
                  <Button
                    className="w-full eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link href="/marketplace">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      {t("howItWorks.step3Cta")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace Overview */}
        <section className="py-24 bg-gradient-to-br from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6 mb-16 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                {t("marketplace.title")}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                {t("marketplace.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="group animate-slide-in-left">
                <div className="glass-card p-8 rounded-2xl hover-lift space-y-6 h-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <ShoppingCart className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {t("marketplace.forSaleTitle")}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{t("marketplace.forSaleBody")}</p>
                  <Button
                    className="w-full eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link href="/marketplace?lloji=shes">
                      <Leaf className="mr-2 h-4 w-4" />
                      {t("marketplace.forSaleCta")}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="group animate-slide-in-right">
                <div className="glass-card p-8 rounded-2xl hover-lift space-y-6 h-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {t("marketplace.wantedTitle")}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{t("marketplace.wantedBody")}</p>
                  <Button
                    className="w-full eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link href="/marketplace?lloji=blej">
                      <Search className="mr-2 h-4 w-4" />
                      {t("marketplace.wantedCta")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
