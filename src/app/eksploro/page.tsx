import { BaseLayout } from "@/components/base-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Users, Leaf, ArrowRight } from "lucide-react"
import { EksploroCTA } from "./cta"

export default function EksploroPage() {
  return (
    <BaseLayout>
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
        <div className="container px-4 md:px-6 relative">
          {/* Hero Section */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center rounded-full glass-card px-4 py-2 text-sm font-semibold mb-8 transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
              Zbulo Mundësitë e Pafundme
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
              Eksploro{" "}
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Mundësitë
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Zbulo partnerët, projektet dhe mundësitë e bashkëpunimit në rrjetin e ekonomisë qarkulluese të Kosovës.
              Bashkohu me komunitetin tonë për të ndërtuar një të ardhme më të qëndrueshme.
            </p>

            <EksploroCTA />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
            <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Rrjetëzimi</h3>
              <p className="text-gray-600 leading-relaxed">
                Lidhu me organizata dhe individë që ndajnë të njëjtat vlera për qëndrueshmërinë.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Leaf className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Qëndrueshmëria</h3>
              <p className="text-gray-600 leading-relaxed">
                Kontribuo në projekte që promovojnë ekonominë qarkulluese dhe mbrojtjen e mjedisit.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover-lift text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Inovacioni</h3>
              <p className="text-gray-600 leading-relaxed">
                Zbulo zgjidhje inovative dhe teknologji të reja për sfidat mjedisore.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
