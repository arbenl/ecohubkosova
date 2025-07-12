"use client"

import { BaseLayout } from "@/components/base-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Target, Globe, Users, CheckCircle, ArrowRight } from "lucide-react"

export default function RrethNeshPage() {
  return (
    <BaseLayout>
      {/* Hero Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center rounded-full glass-card px-4 py-2 text-sm font-semibold mb-8 transition-all duration-300 hover:scale-105">
              <Sparkles className="w-4 h-4 mr-2 text-emerald-600" />
              Njihuni me Misionin Tonë
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
              Rreth{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                Nesh
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
              ECO HUB KOSOVA është platforma e parë e ekonomisë qarkulluese në Kosovë, e krijuar për të lidhur
              partnerët, promovuar bashkëpunimin dhe ndërtuar një ekonomi të qëndrueshme.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:shadow-xl hover:shadow-emerald-400/30 text-white rounded-2xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105">
                <Link href="/auth/regjistrohu">
                  <Users className="mr-2 h-5 w-5" />
                  Regjistrohu Tani
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-2xl px-8 py-4 text-lg font-semibold border-2 border-gray-200 hover:border-emerald-600 hover:text-emerald-700 transition-all duration-300 hover:scale-105 bg-transparent"
              >
                <Link href="/kontakti">
                  Na kontaktoni
                </Link>
              </Button>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
            <div className="glass-card p-8 rounded-2xl hover-lift text-left space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Misioni Ynë</h3>
              <p className="text-gray-600">
                Të krijojmë një platformë që lehtëson bashkëpunimin midis organizatave, bizneseve dhe individëve për të ndërtuar një ekonomi qarkulluese të qëndrueshme në Kosovë.
              </p>
              <p className="text-gray-600">
                Ne besojmë se përmes rrjetëzimit, shkëmbimit të njohurive dhe bashkëpunimit, mund të krijojmë një të ardhme më të gjelbër dhe më të qëndrueshme për të gjithë.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover-lift text-left space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 flex items-center justify-center">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Vizioni Ynë</h3>
              <p className="text-gray-600">
                Të bëhemi platforma kryesore për ekonominë qarkulluese në Ballkanin Perëndimor, duke shërbyer si model për vendet e tjera në rajon.
              </p>
              <p className="text-gray-600">
                Synojmë një Kosovë ku mbetjet minimizohen, burimet ripërdoren dhe ekonomia zhvillohet në harmoni me mjedisin.
              </p>
            </div>
          </div>

          {/* Values Grid */}
          <div className="mt-24 mb-16 text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-8">Vlerat Tona</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                ["Qëndrueshmëria", "Promovojmë praktikat që ruajnë mjedisin dhe sigurojnë një të ardhme të qëndrueshme."],
                ["Bashkëpunimi", "Besojmë në fuqinë e bashkëpunimit për të arritur qëllime të përbashkëta."],
                ["Transparenca", "Operojmë me transparencë të plotë dhe përgjegjësi ndaj komunitetit."],
                ["Inovacioni", "Mbështesim zgjidhjet inovative për sfidat e ekonomisë qarkulluese."],
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
            <h2 className="text-3xl font-bold mb-8">Ekipi Ynë</h2>
            <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur rounded-2xl shadow p-8">
              <Users className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Koalicioni i Ekonomisë Qarkulluese</h3>
              <p className="text-gray-600 mb-6">
                ECO HUB KOSOVA është mbështetur nga Koalicioni i Ekonomisë Qarkulluese, një grup organizatash dhe ekspertësh të angazhuar për promovimin e ekonomisë qarkulluese në Kosovë.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-emerald-600">Ekspertë Mjedisore</h4>
                  <p className="text-sm text-gray-600">Specialistë në qëndrueshmëri dhe mjedis</p>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-600">Liderë Biznesesh</h4>
                  <p className="text-sm text-gray-600">Përfaqësues të sektorit privat</p>
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-600">Aktivistë Socialë</h4>
                  <p className="text-sm text-gray-600">Përfaqësues të shoqërisë civile</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="glass-card max-w-2xl mx-auto p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2">Bashkohu me Ne</h2>
              <p className="text-gray-600 mb-6">Bëhu pjesë e lëvizjes për një ekonomi më të qëndrueshme në Kosovë</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/auth/regjistrohu">
                    Regjistrohu tani <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/kontakti">Na kontaktoni</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
