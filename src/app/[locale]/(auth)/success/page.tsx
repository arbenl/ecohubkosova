import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"

export default async function SuccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("auth")

  return (
    <main className="flex-1 flex items-center justify-center py-12">
      <div className="container px-4 md:px-6 max-w-md">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="rounded-full bg-emerald-100 p-3">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold">{t("success.title")}</h1>
          <p className="text-gray-600">{t("success.body")}</p>
          <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
            <p>{t("success.orgNote")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              asChild
            >
              <Link href="/login">{t("success.loginCta")}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">{t("success.homeCta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
