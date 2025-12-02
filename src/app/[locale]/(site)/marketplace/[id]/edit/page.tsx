import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { redirect, Link } from "@/i18n/routing"
import { getServerUser } from "@/lib/supabase/server"
import { fetchListingById } from "@/services/listings"
import { ListingFormV2 } from "@/components/marketplace-v2/ListingFormV2"
import { updateListingAction } from "@/app/[locale]/(site)/marketplace-v2/actions"
import { getCategories } from "@/db/categories"
import type { ListingFormInput } from "@/validation/listings"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface EditListingPageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { locale, id } = await params
  const tCommon = await getTranslations("common")

  const { user } = await getServerUser()
  if (!user) {
    redirect({ href: `/login?message=${encodeURIComponent(tCommon("loginRequired"))}`, locale })
    return null
  }

  // Fetch listing
  const { data: listing, error } = await fetchListingById(id)

  if (error || !listing) {
    notFound()
  }

  // Check ownership
  if (listing.user_id !== user.id) {
    // If not owner, redirect to details page instead of showing 404
    redirect({ href: `/marketplace/${id}`, locale })
    return null
  }

  // Fetch categories for the form
  const categories = await getCategories(locale as "sq" | "en")

  // Map listing data to form input format
  const initialData: Partial<ListingFormInput> = {
    title: listing.title,
    description: listing.description,
    category_id: listing.category_id || undefined,
    price: listing.price ? Number(listing.price) : undefined,
    currency: listing.currency || "EUR",
    quantity: listing.quantity ? Number(listing.quantity) : undefined,
    unit: listing.unit || undefined,
    flow_type: listing.flow_type as any,
    pricing_type: listing.pricing_type as any,
    condition: listing.condition as any,
    country: "XK",
    city: listing.city || undefined,
    region: listing.region || undefined,
    location_details: listing.location_details || listing.location || undefined,
    eco_labels: listing.eco_labels || [],
    tags: listing.tags || [],
    eco_score: listing.eco_score ? Number(listing.eco_score) : undefined,
  }

  // Create a bind for the server action
  const updateAction = async (data: ListingFormInput) => {
    "use server"
    return updateListingAction(id, data, locale)
  }

  return (
    <div className="container py-10">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/marketplace/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to listing
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Listing</h1>
        <p className="text-gray-600">Update your listing details below</p>
      </div>

      {/* Form */}
      <ListingFormV2
        mode="edit"
        initialData={initialData}
        categories={categories}
        submit={updateAction}
      />
    </div>
  )
}
