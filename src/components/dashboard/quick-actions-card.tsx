"use client"

import Link from "next/link"
import { ShoppingCart, Users, BookOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"

const QUICK_ACTIONS = [
  {
    titleKey: "addListing",
    descriptionKey: "addListingDesc",
    href: "/marketplace/add",
    Icon: ShoppingCart,
  },
  {
    titleKey: "explorePartners",
    descriptionKey: "explorePartnersDesc",
    href: "/organizations",
    Icon: Users,
  },
  {
    titleKey: "knowledgeCenter",
    descriptionKey: "knowledgeCenterDesc",
    href: "/knowledge",
    Icon: BookOpen,
  },
  {
    titleKey: "updateProfile",
    descriptionKey: "updateProfileDesc",
    href: "/profile",
    Icon: User,
  },
] as const

export function QuickActionsCard() {
  const locale = useLocale()
  const t = useTranslations('dashboard')

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-gray-900">{t('quickActions')}</CardTitle>
        <CardDescription>{t('quickActionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ titleKey, descriptionKey, href, Icon }) => (
            <Button
              key={href}
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-3 rounded-xl hover-lift bg-transparent"
              asChild
            >
              <Link href={`/${locale}${href}`}>
                <Icon className="h-8 w-8 text-emerald-600" />
                <span className="text-sm font-medium text-center">{t(titleKey)}</span>
                <span className="text-xs text-gray-500 text-center">{t(descriptionKey)}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
