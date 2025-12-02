import { Link } from "@/i18n/routing"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Package, Euro, ShieldAlert } from "lucide-react"
import { getServerUser } from "@/lib/supabase/server"
import ContactListingButton from "./contact-listing-button"
import { ContactCardV2 } from "@/components/marketplace-v2/ContactCardV2"
import { fetchListingById, fetchListingByIdForOwner } from "@/services/listings"
import type { Listing } from "@/types"
import { getLocale, getTranslations } from "next-intl/server"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { OwnerListingActions } from "./owner-listing-actions"

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const locale = await getLocale()
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const t = await getTranslations("marketplace-v2")
  const { user } = await getServerUser()

  const ownerListing = user?.id ? await fetchListingByIdForOwner(id, user.id) : null
  const { data: publicListing, error } = await fetchListingById(id)
  const listing = publicListing || ownerListing?.data
  const isOwner = Boolean(ownerListing?.data && user?.id && ownerListing.data.user_id === user.id)
  const isArchived = listing?.status === "ARCHIVED" || listing?.visibility === "PRIVATE"
  const successMessage =
    typeof resolvedSearchParams?.message === "string"
      ? decodeURIComponent(resolvedSearchParams.message)
      : undefined

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("sq-XK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!listing && error) {
    return (
      <div className="flex min-h-screen flex-col">
        <>
          <main className="flex-1 py-12">
            <div className="container px-4 md:px-6">
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">{t("detail.notFoundTitle")}</h1>
                <p className="text-gray-600 mb-6">{error || t("detail.notFoundDescription")}</p>
                <Button asChild>
                  <Link href="/marketplace">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("pagination.previous")}
                  </Link>
                </Button>
              </div>
            </div>
          </main>
        </>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">{t("detail.notFoundTitle")}</h1>
              <p className="text-gray-600 mb-6">{t("detail.notFoundDescription")}</p>
              <Button asChild>
                <Link href="/marketplace">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("pagination.previous")}
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const flowTypeLabel = listing.flow_type
    ? t(`flowTypes.${listing.flow_type}` as any)
    : listing.listing_type === "shes"
      ? t("flowTypes.OFFER_MATERIAL")
      : t("flowTypes.REQUEST_MATERIAL")
  const locationLabel = listing.location || listing.city || ""
  return (
    <div className="flex min-h-screen flex-col">
      <>
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6 max-w-4xl">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link href="/marketplace">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("pagination.previous")}
                </Link>
              </Button>
            </div>

            {successMessage ? (
              <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-900">
                <AlertTitle>{t("updateSuccess")}</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            ) : null}

            {isOwner && isArchived ? (
              <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>{t("detail.notFoundTitle")}</AlertTitle>
                <AlertDescription>{t("detail.notFoundDescription")}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={
                          listing.listing_type === "shes"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }
                      >
                        {flowTypeLabel}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(listing.created_at)}
                      </span>
                    </div>

                    <CardTitle className="text-3xl font-bold">{listing.title}</CardTitle>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {listing.category_name_sq || listing.category_name_en || listing.category}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{t("detail.overview")}</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {listing.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Euro className="h-5 w-5 text-gray-500" />
                        <div>
                          <span className="font-medium">{t("detail.price")}:</span>
                          <p className="text-lg font-bold text-emerald-600">
                            {listing.price !== null ? `${listing.price}` : t("pricingTypes.FREE")}{" "}
                            {listing.currency || "€"} {listing.unit && `/ ${listing.unit}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-gray-500" />
                        <div>
                          <span className="font-medium">{t("detail.quantity")}:</span>
                          <p>{listing.quantity}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <div>
                          <span className="font-medium">{t("detail.location")}:</span>
                          <p>{locationLabel}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <span className="font-medium">
                            {t("detail.postedOn", { date: formatDate(listing.created_at) })}
                          </span>
                          <p>{formatDate(listing.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <ContactCardV2 listing={listing} listingUrl={`/marketplace/${listing.id}`} />
                <ContactListingButton listing={listing} user={user} />
                {isOwner ? (
                  <OwnerListingActions
                    listingId={listing.id}
                    locale={locale}
                    isArchived={isArchived}
                  />
                ) : null}

                {/* Quick Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("detail.ecoInfo")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("detail.condition")}:</span>
                      <span className="font-medium">{flowTypeLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("form.category")}:</span>
                      <span className="font-medium">{listing.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("form.unit")}:</span>
                      <span className="font-medium">{listing.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("detail.location")}:</span>
                      <span className="font-medium">{locationLabel}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button asChild variant="outline">
                <Link href="/marketplace">{t("browseListings")}</Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    </div>
  )
}
