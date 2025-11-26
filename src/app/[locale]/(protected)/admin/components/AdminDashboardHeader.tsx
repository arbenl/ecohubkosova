"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface AdminDashboardHeaderProps {
  locale: string
}

export function AdminDashboardHeader({ locale }: AdminDashboardHeaderProps) {
  const t = useTranslations("admin-workspace")

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border border-emerald-100 mb-8">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-transparent"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-emerald-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-emerald-300/10 rounded-full blur-2xl"></div>
      </div>
      <div className="relative px-6 py-8 md:px-8 md:py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
              {t("title")}
            </h1>
            <p className="text-lg text-gray-600 mb-4">{t("subtitle")}</p>
            <p className="text-sm text-emerald-700 font-medium">
              {t("welcome", {
                date: new Date().toLocaleDateString(locale === "sq" ? "sq-AL" : "en-US"),
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-emerald-200 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              onClick={() => window.location.reload()}
              aria-label={t("refreshAriaLabel")}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("refresh")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
