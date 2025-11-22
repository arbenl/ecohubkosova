import { getServerUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"
import { getSavedListings } from "@/services/marketplace/interactions-service"
import SavedListingsClient from "./saved-listings-client"

export async function generateMetadata() {
  const t = await getTranslations("marketplace-v2")
  return {
    title: t("savedListings.title"),
    description: t("savedListings.subtitle"),
  }
}

export default async function SavedListingsPage() {
  const locale = await getLocale()
  const t = await getTranslations("marketplace-v2")
  const { user } = await getServerUser()

  // Redirect to login if not authenticated
  if (!user?.id) {
    redirect(`/${locale}/login?message=Please login to view saved listings`)
  }

  const { listings, total } = await getSavedListings(user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">
            {t("savedListings.title")}
          </h1>
          <p className="text-lg text-emerald-700">
            {t("savedListings.subtitle")}
          </p>
        </div>

        {/* Content */}
        <SavedListingsClient
          initialListings={listings}
          total={total}
          locale={locale}
        />
      </div>
    </div>
  )
}
