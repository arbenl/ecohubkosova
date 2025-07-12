"use client"

import { BaseLayout } from "@/components/base-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Building, Users, MapPin } from "lucide-react"

export default function PartnerePage() {
  return (
    <BaseLayout>
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50"></div>
        <div className="container px-4 md:px-6 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-flex items-center rounded-full glass-card px-4 py-2 text-sm font-semibold mb-8 transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur">
              <Users className="w-4 h-4 mr-2 text-purple-600" />
              Rrjeti ynë i fuqishëm
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
              Partnerët{" "}
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                Tanë
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
              Zbulo rrjetin tonë të partnerëve të angazhuar në ekonominë qarkulluese të Kosovës
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up mb-24">
            {[
              {
                icon: <Building className="h-10 w-10 text-purple-600" />,
                title: "50+",
                subtitle: "Organizata Partnere",
              },
              {
                icon: <Users className="h-10 w-10 text-purple-600" />,
                title: "200+",
                subtitle: "Anëtarë Aktivë",
              },
              {
                icon: <MapPin className="h-10 w-10 text-purple-600" />,
                title: "7",
                subtitle: "Qytete të Kosovës",
              },
            ].map(({ icon, title, subtitle }) => (
              <div key={title} className="glass-card text-center p-8 rounded-2xl bg-white/70 hover:shadow-xl transition-shadow">
                <div className="mb-4">{icon}</div>
                <h3 className="text-3xl font-bold text-purple-700">{title}</h3>
                <p className="text-gray-600 mt-2">{subtitle}</p>
              </div>
            ))}
          </div>

          {/* Partner Categories */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-12">Llojet e Partnerëve</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Organizata Joqeveritare",
                  description: "OJQ-të që punojnë për promovimin e qëndrueshmërisë dhe ekonomisë qarkulluese",
                  items: ["Edukimi mjedisor", "Sensibilizimi i publikut", "Projekte komunitare", "Advokimi për politika"],
                },
                {
                  title: "Ndërmarrje Sociale",
                  description: "Biznese që kombinojnë qëllimet sociale me qëndrueshmërinë ekonomike",
                  items: ["Inovacione të gjelbra", "Punësimi i grupeve vulnerabël", "Zgjidhje të qëndrueshme", "Impakti social"],
                },
                {
                  title: "Kompani",
                  description: "Biznese që kanë integruar parimet e ekonomisë qarkulluese në operacionet e tyre",
                  items: ["Riciklimi dhe ripërdorimi", "Energjia e ripërtëritshme", "Prodhimi i qëndrueshëm", "Zinxhiri i furnizimit të gjelbër"],
                },
              ].map(({ title, description, items }) => (
                <div key={title} className="glass-card p-6 rounded-2xl text-left bg-white/80 space-y-4 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-purple-600">{title}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                  <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                    {items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="glass-card max-w-2xl mx-auto p-8 rounded-2xl bg-white/80">
              <h2 className="text-2xl font-bold mb-2 text-purple-700">Bëhu Partner</h2>
              <p className="text-gray-600 mb-6">
                Bashkohu me rrjetin tonë të partnerëve dhe kontribuo në ekonominë qarkulluese të Kosovës
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-md transition">
                  <Link href="/drejtoria">Shiko të gjithë partnerët</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/auth/regjistrohu">Regjistrohu si partner</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
