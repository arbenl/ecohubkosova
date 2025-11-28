"use client"

import { Leaf, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"

interface EmptyStateProps {
  locale: string
  user?: any
}

export function EmptyState({ locale, user }: EmptyStateProps) {
  const t = useTranslations("marketplace-v2")

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-emerald-50 p-6 mb-6">
        <Leaf className="h-16 w-16 text-emerald-600" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("emptyState")}</h3>

      <p className="text-muted-foreground text-center max-w-md mb-6">
        {t("emptyStateDescription")}
      </p>

      {user && (
        <Button
          asChild
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
        >
          <Link href="/marketplace/add">
            <Plus className="mr-2 h-4 w-4" />
            {t("createListing")}
          </Link>
        </Button>
      )}
    </div>
  )
}
