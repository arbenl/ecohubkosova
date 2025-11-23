// src/app/api/marketplace/listings/route.ts
// V2 Migration: This route now queries eco_listings (V2) instead of tregu_listime (V1)
import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/drizzle"
import { ecoListings, ecoCategories } from "@/db/schema"
import { and, eq, ilike, desc, asc } from "drizzle-orm"
import { sql } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Parse filters from query params (V1 style for backward compatibility)
    const page = Number(searchParams.get("page") ?? "1")
    const pageSize = Number(searchParams.get("pageSize") ?? "12")
    const type = searchParams.get("type") // V1 used 'shes'/'blej', we'll map to flow_type
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const condition = searchParams.get("condition")
    const location = searchParams.get("location")
    const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest"
    const locale = searchParams.get("locale") ?? "sq" // Default to Albanian

    const offset = (page - 1) * pageSize

    // Build filters for V2 schema
    const filters = [eq(ecoListings.status, "ACTIVE"), eq(ecoListings.visibility, "PUBLIC")]

    // Map V1 listing_type to V2 flow_type
    if (type && type !== "te-gjitha") {
      // V1: 'shes' (sell) → V2: OFFER_* types
      // V1: 'blej' (buy) → V2: REQUEST_* types
      // For simplicity, we'll filter by the most common flow types
      if (type === "shes") {
        // Show all offer types - cast enum to text for LIKE comparison
        filters.push(sql`${ecoListings.flow_type}::text ILIKE 'OFFER%'`)
      } else if (type === "blej") {
        // Show all request types - cast enum to text for LIKE comparison
        filters.push(sql`${ecoListings.flow_type}::text ILIKE 'REQUEST%'`)
      }
    }

    if (search?.trim()) {
      filters.push(ilike(ecoListings.title, `%${search.trim()}%`))
    }

    if (category && category !== "all") {
      // V1 used category names directly, V2 uses category_id
      // We'll search by category name for backward compatibility
      filters.push(ilike(ecoCategories.name_sq, `%${category}%`))
    }

    if (condition?.trim()) {
      filters.push(eq(ecoListings.condition, condition.trim() as any))
    }

    if (location?.trim()) {
      filters.push(ilike(ecoListings.city, `%${location.trim()}%`))
    }

    const whereClause = filters.length === 1 ? filters[0] : and(...filters)

    // Query with joins (V2 schema)
    // Select appropriate category name based on locale
    const categoryNameField = locale === "en" ? ecoCategories.name_en : ecoCategories.name_sq

    const rows = await db
      .get()
      .select({
        id: ecoListings.id,
        title: ecoListings.title,
        description: ecoListings.description,
        category: categoryNameField, // Use appropriate language category name
        price: ecoListings.price,
        unit: ecoListings.unit,
        location: ecoListings.city,
        quantity: ecoListings.quantity,
        listing_type: ecoListings.flow_type, // Map flow_type to listing_type
        gjendja: ecoListings.condition,
        created_at: ecoListings.created_at,
        // V2 specific fields that V1 didn't have
        flow_type: ecoListings.flow_type,
        pricing_type: ecoListings.pricing_type,
        city: ecoListings.city,
        eco_labels: ecoListings.eco_labels,
        tags: ecoListings.tags,
        category_name_en: ecoCategories.name_en,
        category_name_sq: ecoCategories.name_sq,
      })
      .from(ecoListings)
      .leftJoin(ecoCategories, eq(ecoListings.category_id, ecoCategories.id))
      .where(whereClause)
      .orderBy(sort === "oldest" ? asc(ecoListings.created_at) : desc(ecoListings.created_at))
      .limit(pageSize + 1) // +1 to check if there are more
      .offset(offset)

    const hasMore = rows.length > pageSize
    const listings = rows.slice(0, pageSize)

    return NextResponse.json({
      listings,
      hasMore,
      page,
      pageSize,
    })
  } catch (error) {
    console.error("[Marketplace API] DB error loading listings (V2)", error)

    return NextResponse.json(
      {
        error: "db_unavailable",
        message: "Database is temporarily unavailable for marketplace.",
      },
      { status: 503 }
    )
  }
}
