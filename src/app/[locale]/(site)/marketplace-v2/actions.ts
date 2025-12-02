"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"
import { listingFormSchema, type ListingFormInput } from "@/validation/listings"
import { db } from "@/lib/drizzle"
import { ecoListings, ecoListingMedia } from "@/db/schema/marketplace-v2"
import { eq } from "drizzle-orm"
import { isMarketplaceV2WritesEnabled } from "@/lib/env"

const warnIfV2FlagDisabled = () => {
  if (!isMarketplaceV2WritesEnabled()) {
    console.warn(
      "[marketplace] USE_MARKETPLACE_V2_WRITES is false, but V1 path is retired. Continuing with eco_listings."
    )
  }
}

/**
 * Create a new listing
 */
export async function createListingAction(formData: ListingFormInput, locale: string) {
  const t = await getTranslations("marketplace-v2")
  const tCommon = await getTranslations("common")
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({
      href: `/login?message=${encodeURIComponent(tCommon("loginRequired"))}`,
      locale,
    })
    return { error: "Unauthorized" }
  }

  const parsed = listingFormSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? t("createError") }
  }

  const payload = parsed.data

  try {
    warnIfV2FlagDisabled()

    const result = await db
      .get()
      .insert(ecoListings)
      .values({
        title: payload.title,
        description: payload.description,
        flow_type: payload.flow_type as any,
        condition: payload.condition ? (payload.condition as any) : null,
        lifecycle_stage: payload.lifecycle_stage ? (payload.lifecycle_stage as any) : null,
        quantity: payload.quantity ? payload.quantity.toString() : null,
        unit: payload.unit || null,
        price: payload.price ? payload.price.toString() : null,
        currency: payload.currency,
        pricing_type: payload.pricing_type as any,
        country: payload.country,
        city: payload.city || null,
        region: payload.region || null,
        location_details: payload.location_details || null,
        eco_labels: payload.eco_labels.length > 0 ? payload.eco_labels : [],
        eco_score: payload.eco_score ? parseInt(payload.eco_score.toString()) : null,
        tags: payload.tags.length > 0 ? payload.tags : [],
        category_id: payload.category_id,
        created_by_user_id: user.id,
        status: "DRAFT" as any,
        visibility: "PRIVATE",
      })
      .returning({ id: ecoListings.id })

    const listingId = result?.[0]?.id

    // Insert media if provided
    if (listingId && payload.media && payload.media.length > 0) {
      await db
        .get()
        .insert(ecoListingMedia)
        .values(
          payload.media.map((item, index) => ({
            listing_id: listingId,
            url: item.url,
            storage_path: item.storage_path || null,
            file_type: item.file_type,
            mime_type: item.mime_type || null,
            file_size: item.file_size || null,
            is_primary: item.is_primary || index === 0,
            sort_order: index,
            alt_text: item.alt_text || null,
            caption: item.caption || null,
          }))
        )
    }

    revalidatePath("/marketplace")
    revalidatePath("/my/listings")
    if (listingId) {
      redirect({
        href: `/marketplace/${listingId}/edit?created=1&message=${encodeURIComponent(t("createSuccess"))}`,
        locale,
      })
    }
    redirect({ href: `/marketplace?message=${encodeURIComponent(t("createSuccess"))}`, locale })
  } catch (error: any) {
    console.error("Server Action Error (createListingAction):", error)
    return { error: error.message || t("createError") }
  }
}

/**
 * Update an existing listing
 */
export async function updateListingAction(
  listingId: string,
  formData: ListingFormInput,
  locale: string
) {
  const t = await getTranslations("marketplace-v2")
  const tCommon = await getTranslations("common")
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({
      href: `/login?message=${encodeURIComponent(tCommon("loginRequired"))}`,
      locale,
    })
    return { error: "Unauthorized" }
  }

  const parsed = listingFormSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? t("updateError") }
  }

  const payload = parsed.data

  try {
    warnIfV2FlagDisabled()

    // Verify ownership
    const existingListing = await db
      .get()
      .select({
        created_by_user_id: ecoListings.created_by_user_id,
        status: ecoListings.status,
        visibility: ecoListings.visibility,
      })
      .from(ecoListings)
      .where(eq(ecoListings.id, listingId))
      .limit(1)

    if (!existingListing.length || existingListing[0].created_by_user_id !== user.id) {
      return { error: tCommon("accessDenied") }
    }

    const isArchived = existingListing[0].status === "ARCHIVED"

    await db
      .get()
      .update(ecoListings)
      .set({
        title: payload.title,
        description: payload.description,
        flow_type: payload.flow_type as any,
        condition: payload.condition ? (payload.condition as any) : null,
        lifecycle_stage: payload.lifecycle_stage ? (payload.lifecycle_stage as any) : null,
        quantity: payload.quantity ? payload.quantity.toString() : null,
        unit: payload.unit || null,
        price: payload.price ? payload.price.toString() : null,
        currency: payload.currency,
        pricing_type: payload.pricing_type as any,
        country: payload.country,
        city: payload.city || null,
        region: payload.region || null,
        location_details: payload.location_details || null,
        eco_labels: payload.eco_labels.length > 0 ? payload.eco_labels : [],
        eco_score: payload.eco_score ? parseInt(payload.eco_score.toString()) : null,
        tags: payload.tags.length > 0 ? payload.tags : [],
        category_id: payload.category_id,
        updated_at: new Date(),
        status: isArchived ? "ARCHIVED" : "ACTIVE",
        visibility: isArchived ? (existingListing[0].visibility ?? "PRIVATE") : "PUBLIC",
      })
      .where(eq(ecoListings.id, listingId))

    // Update media: delete old ones and insert new ones
    if (payload.media && payload.media.length > 0) {
      // Delete existing media
      await db.get().delete(ecoListingMedia).where(eq(ecoListingMedia.listing_id, listingId))

      // Insert new media
      await db
        .get()
        .insert(ecoListingMedia)
        .values(
          payload.media.map((item, index) => ({
            listing_id: listingId,
            url: item.url,
            storage_path: item.storage_path || null,
            file_type: item.file_type,
            mime_type: item.mime_type || null,
            file_size: item.file_size || null,
            is_primary: item.is_primary || index === 0,
            sort_order: index,
            alt_text: item.alt_text || null,
            caption: item.caption || null,
          }))
        )
    }

    revalidatePath(`/marketplace/${listingId}`)
    revalidatePath("/marketplace")
    revalidatePath("/my/listings")
    redirect({
      href: `/marketplace/${listingId}?message=${encodeURIComponent(t("updateSuccess"))}`,
      locale,
    })
  } catch (error: any) {
    console.error("Server Action Error (updateListingAction):", error)
    return { error: error.message || t("updateError") }
  }
}
