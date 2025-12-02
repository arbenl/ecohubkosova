import type { Listing } from "@/types"
import type { ListingCreateInput } from "@/validation/listings"
import type { ListingRow } from "./types"

/**
 * Format a database row into a Listing object.
 * Maps database columns (including gjendja) to the Listing type.
 */
export const formatListingRow = (row: ListingRow): Listing => {
  const price =
    row.listing.price !== null && row.listing.price !== undefined ? Number(row.listing.price) : null
  const city = row.listing.city || row.listing.region || row.listing.location_details || ""
  const flowType = row.listing.flow_type || null
  const listingType: "shes" | "blej" = flowType?.startsWith("OFFER") ? "shes" : "blej"
  const locationParts = [row.listing.city, row.listing.region].filter(Boolean)

  // Use normalized contact fields from organizations table (no metadata parsing needed)
  const orgPhone = row.organization_phone || null
  const orgWebsite = row.organization_website || null
  const orgContactPerson = row.organization_contact_person || null

  return {
    id: row.listing.id,
    title: row.listing.title,
    description: row.listing.description || "",
    foto_url: null,
    price,
    currency: row.listing.currency,
    category: row.category_name_sq || row.category_name_en || "",
    category_id: row.listing.category_id || undefined,
    condition: row.listing.condition || "",
    location: locationParts.join(", "),
    contact: row.organization_email ?? row.owner_email ?? "",
    created_at: row.listing.created_at.toISOString(),
    updated_at: row.listing.updated_at?.toISOString?.() ?? row.listing.created_at.toISOString(),
    user_id: row.listing.created_by_user_id,
    is_published: true,
    flow_type: flowType || undefined,
    pricing_type: row.listing.pricing_type,
    visibility: row.listing.visibility,
    status: row.listing.status,
    city,
    region: row.listing.region,
    location_details: row.listing.location_details,
    eco_labels: row.listing.eco_labels,
    eco_score: row.listing.eco_score,
    tags: row.listing.tags,
    category_name_en: row.category_name_en,
    category_name_sq: row.category_name_sq,
    organization_id: row.listing.organization_id,
    organization_name: row.organization_name,
    organization_contact_email: row.organization_email,
    organization_contact_phone: orgPhone,
    organization_contact_website: orgWebsite,
    organization_contact_person: orgContactPerson,
    creator_full_name: row.owner_name,
    creator_email: row.owner_email,
    users: row.owner_name
      ? {
          full_name: row.owner_name,
          email: row.owner_email ?? undefined,
        }
      : undefined,
    organizations: row.organization_name
      ? {
          name: row.organization_name,
          contact_email: row.organization_email ?? undefined,
          contact_person: orgContactPerson ?? undefined,
        }
      : undefined,
    quantity: row.listing.quantity?.toString() || "",
    unit: row.listing.unit || "",
    listing_type: listingType,
  }
}

export const formatPrice = (value: ListingCreateInput["price"]) => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value.toFixed(2)
  }
  return null
}

export const mapFlowType = (listingType: ListingCreateInput["listing_type"]) => {
  return listingType === "shes" ? "OFFER_MATERIAL" : "REQUEST_MATERIAL"
}
