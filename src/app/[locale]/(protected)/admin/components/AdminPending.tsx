"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"
import { Link } from "@/i18n/routing"

type PendingCard = {
  title: string
  count: number
  href: string
  icon: React.ReactNode
}

export function AdminPending({ cards, locale }: { cards: PendingCard[]; locale: string }) {
  const filtered = cards.filter((card) => card.count !== undefined && card.count !== null)

  if (filtered.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Approvals & queue</h2>
        <span className="text-sm text-gray-500">
          {filtered.reduce((sum, c) => sum + Number(c.count || 0), 0)} open items
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((card) => (
          <Card
            key={card.title}
            className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 card-lift"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">{card.title}</CardTitle>
              <div className="p-2 rounded-full bg-emerald-50 text-emerald-700">{card.icon}</div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{card.count}</div>
              <Link
                href={card.href}
                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 group"
                prefetch={false}
              >
                View
                <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
