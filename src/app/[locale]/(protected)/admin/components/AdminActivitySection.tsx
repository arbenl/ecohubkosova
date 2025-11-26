"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminActivitySectionProps {
  // No props needed - locale handled by useTranslations
}

export function AdminActivitySection() {
  const t = useTranslations("admin-workspace")
  const { toast } = useToast()

  const handleSetupActivity = () => {
    toast({
      title: t("activity.comingSoon"),
      description: t("activity.setupDescription"),
    })
  }

  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-6">
        {t("activity.title")}
      </h2>
      <Card className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("activity.emptyTitle")}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{t("activity.emptyDescription")}</p>
          <Button
            variant="outline"
            className="rounded-full border-emerald-200 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            onClick={handleSetupActivity}
          >
            {t("activity.setup")}
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
