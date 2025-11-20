"use client"

import { useLocale, useTranslations } from "next-intl"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export function LocaleWarningBanner() {
  const locale = useLocale()
  const t = useTranslations("common")

  // Only show banner for non-Albanian locales
  if (locale === "sq") {
    return null
  }

  return (
    <Alert className="mb-8 border-amber-200 bg-amber-50">
      <Info className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">{t("albanianOnlyTitle")}</AlertTitle>
      <AlertDescription className="text-amber-800">{t("albanianOnlyDescription")}</AlertDescription>
    </Alert>
  )
}
