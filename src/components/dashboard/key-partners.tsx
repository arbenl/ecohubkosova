"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useKeyPartnersSection } from "@/hooks/use-dashboard-sections"
import { useTranslations } from "next-intl"

export function KeyPartners({ keyPartners }: { keyPartners: any[] }) {
  const t = useTranslations('dashboard')
  const { items, hasItems, ctaHref, ctaLabel, emptyMessage } = useKeyPartnersSection(keyPartners)

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-gray-900">{t('keyPartners')}</CardTitle>
        <CardDescription>{t('keyPartnersDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasItems ? (
          <>
            {items.map((partner) => (
              <div key={partner.id} className="border-b pb-4 last:border-0 last:pb-0">
                <h3 className="font-medium text-gray-900 line-clamp-1">{partner.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{partner.meta}</p>
                <div className="flex justify-end mt-2">
                  <Button variant="ghost" size="sm" className="text-emerald-600 rounded-lg" asChild>
                    <Link href={partner.href}>
                      Shiko <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full rounded-xl bg-transparent" asChild>
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}
