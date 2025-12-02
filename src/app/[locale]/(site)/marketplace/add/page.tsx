import { getLocale, getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { getCategories } from "@/db/categories"
import { ListingFormV2 } from "@/components/marketplace-v2/ListingFormV2"
import { createListingAction } from "@/app/[locale]/(site)/marketplace-v2/actions"
import type { ListingFormInput } from "@/validation/listings"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function AddListingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const resolvedLocale = (await getLocale()) as "sq" | "en"
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "marketplace-v2" })
  const categories = await getCategories(resolvedLocale)

  const createAction = async (data: ListingFormInput) => {
    "use server"
    return createListingAction(data, locale)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="container px-4 md:px-8 py-10 max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/my/listings">
              <ArrowLeft className="h-4 w-4" />
              {t("pagination.previous")}
            </Link>
          </Button>
          <div className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            {t("createListing")}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm uppercase tracking-wide text-emerald-600 font-semibold">
            {t("quickActions.listings.title")}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{t("form.addListing")}</h1>
          <p className="mt-2 text-gray-600">{t("alerts.description")}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 md:p-8">
          <ListingFormV2 mode="create" categories={categories} submit={createAction} />
        </div>
      </div>
    </div>
  )
}
