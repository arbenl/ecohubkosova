"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { RefreshCw, Shield } from "lucide-react"
import { SectionIcon, sectionColors } from "@/components/ui/section-indicators"

interface AdminDashboardHeaderProps {
  locale: string
}

export function AdminDashboardHeader({ locale }: AdminDashboardHeaderProps) {
  const t = useTranslations("admin-workspace")
  const colors = sectionColors.admin

  return (
    <section className="relative overflow-hidden rounded-2xl border mb-8 bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-100">
      {/* Admin accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />

      {/* Background decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-transparent"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-orange-300/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative px-6 py-8 md:px-8 md:py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <SectionIcon section="admin" size="lg">
              <Shield className="h-6 w-6" />
            </SectionIcon>
            <div>
              <p className={`text-xs uppercase tracking-widest font-semibold mb-1 ${colors.text}`}>
                Administrata
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
                {t("title")}
              </h1>
              <p className="text-lg text-gray-600 mb-2">{t("subtitle")}</p>
              <p className={`text-sm font-medium ${colors.text}`}>
                {t("welcome", {
                  date: new Date().toLocaleDateString(locale === "sq" ? "sq-AL" : "en-US"),
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-amber-200 hover:bg-amber-50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
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
