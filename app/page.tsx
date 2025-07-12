import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus, Search, MessageCircle, ShoppingCart, Sparkles, Leaf, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 eco-gradient-light"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center text-center space-y-10 animate-fade-in">
              <div className="inline-flex items-center rounded-full glass-card px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105">
                <Sparkles className="w-4 h-4 mr-2 text-[#00C896]" />
                Mbështetur nga Koalicioni i Ekonomisë Qarkulluese
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Lidhu. Bashkëpuno.{" "}
                <span className="bg-gradient-to-r from-[#00C896] to-[#00A07E] bg-clip-text text-transparent font-extrabold">
                  Krijo Qarkullim.
                </span>
              </h1>

              <p className="max-w-4xl text-xl md:text-2xl text-gray-600 leading-relaxed">
                Platforma e parë e ekonomisë qarkulluese në Kosovë. Lidhu me partnerë, zbulo mundësi dhe krijo qarkullim
                të qëndrueshëm për një të ardhme më të gjelbër.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Button
                  size="lg"
                  className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/auth/regjistrohu">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Fillo Bashkëpunimin
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/eksploro">
                    <Search className="mr-2 h-5 w-5" />
                    Eksploro Rrjetin
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
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Si Funksionon</h2>
              <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                Tre hapa të thjeshtë për të filluar bashkëpunimin në ekonominë qarkulluese
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group animate-slide-in-left">
                <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6 h-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <UserPlus className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Krijo Profilin Tënd</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Regjistrohu si individ ose organizatë dhe krijo profilin tënd në platformë për të filluar
                    rrjetëzimin.
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/25 text-white rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link href="/eksploro">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Eksploro Tani
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="group animate-slide-up">
                <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6 h-full bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Zbulo Mundësitë</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Eksploro partnerët potencialë, artikujt e dijes dhe mundësitë e bashkëpunimit në treg.
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/25 text-white rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link href="/partnere">
                      <Search className="mr-2 h-4 w-4" />
                      Shiko Partnerët
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="group animate-slide-in-right">
                <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6 h-full bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MessageCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Fillo Bisedimet</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Kontakto partnerët potencialë dhe fillo bashkëpunimin për projekte të qëndrueshme dhe inovative.
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:shadow-xl hover:shadow-orange-500/25 text-white rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link href="/tregu">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Shiko Tregun
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
                Tregu i Ekonomisë Qarkulluese
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
                Zbulo mundësitë e tregut për materiale, produkte dhe shërbime të qëndrueshme
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="group animate-slide-in-left">
                <div className="glass-card p-8 rounded-2xl hover-lift space-y-6 h-full bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <ShoppingCart className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Për Shitje</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Zbulo materialet, produktet dhe shërbimet e disponueshme nga partnerët në rrjet për ekonomi
                    qarkulluese.
                  </p>
                  <Button
                    className="w-full eco-gradient hover:shadow-xl hover:shadow-[#00C896]/25 text-white rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link href="/tregu?lloji=shes">
                      <Leaf className="mr-2 h-4 w-4" />
                      Shiko Ofertat
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="group animate-slide-in-right">
                <div className="glass-card p-8 rounded-2xl hover-lift space-y-6 h-full bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Kërkoj të Blej</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Zbulo kërkesat për materiale, produkte dhe shërbime nga partnerët në rrjet për projekte të
                    përbashkëta.
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:shadow-xl hover:shadow-cyan-500/25 text-white rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link href="/tregu?lloji=blej">
                      <Search className="mr-2 h-4 w-4" />
                      Shiko Kërkesat
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
