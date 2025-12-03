"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ClipboardList, ShieldCheck, FileCheck, Users, Building, ShoppingCart } from "lucide-react"

const actions = [
  {
    icon: <Users className="h-5 w-5" />,
    href: "/admin/users",
    translationKey: "quickActions.users",
    descriptionKey: "quickActions.usersDescription",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    href: "/admin/organization-members",
    translationKey: "quickActions.members",
    descriptionKey: "quickActions.membersDescription",
  },
  {
    icon: <Building className="h-5 w-5" />,
    href: "/admin/organizations",
    translationKey: "quickActions.organizations",
    descriptionKey: "quickActions.organizationsDescription",
  },
  {
    icon: <FileCheck className="h-5 w-5" />,
    href: "/admin/articles",
    translationKey: "quickActions.articles",
    descriptionKey: "quickActions.articlesDescription",
  },
  {
    icon: <ShoppingCart className="h-5 w-5" />,
    href: "/admin/listings",
    translationKey: "quickActions.listings",
    descriptionKey: "quickActions.listingsDescription",
  },
]

export function AdminQuickActions({ locale }: { locale: string }) {
  const t = useTranslations("admin-workspace")

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t("quickActions.title")}</h2>
          <p className="text-sm text-gray-600">{t("quickActions.description")}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {actions.map((action) => (
          <Card
            key={action.translationKey}
            className="rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1 card-lift"
          >
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <div className="p-2 rounded-lg bg-emerald-50">{action.icon}</div>
                <span className="text-sm font-semibold">{t(action.translationKey)}</span>
              </div>
              <p className="text-sm text-gray-600">{t(action.descriptionKey)}</p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="justify-start interactive-press"
              >
                <Link href={action.href} prefetch={false}>
                  {t("quickActions.go")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
